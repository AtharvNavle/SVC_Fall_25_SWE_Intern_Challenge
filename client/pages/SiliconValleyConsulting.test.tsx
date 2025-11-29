import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SiliconValleyConsulting from './SiliconValleyConsulting';
import { AuthProvider } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

// Mock supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithOtp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SiliconValleyConsulting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    // Mock fetch for API calls
    global.fetch = vi.fn();
  });

  it('renders company information', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <SiliconValleyConsulting />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Silicon Valley Consulting/i)).toBeInTheDocument();
    expect(screen.getByText(/Compensation Package/i)).toBeInTheDocument();
  });

  it('shows sign in alert when user is not authenticated', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <SiliconValleyConsulting />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Sign in required/i)).toBeInTheDocument();
  });

  it('shows authenticated user info when signed in', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
    };
    
    const mockSession = {
      access_token: 'token',
      refresh_token: 'refresh',
      expires_in: 3600,
      expires_at: Date.now() / 1000 + 3600,
      token_type: 'bearer',
      user: mockUser,
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <SiliconValleyConsulting />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Signed in as:/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });
  });

  it('handles join slack request', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
    };
    
    const mockSession = {
      access_token: 'token',
      refresh_token: 'refresh',
      expires_in: 3600,
      expires_at: Date.now() / 1000 + 3600,
      token_type: 'bearer',
      user: mockUser,
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    vi.mocked(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: "We've just pinged them. You'll be sent an email and text invite within 72 hours.",
      }),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <SiliconValleyConsulting />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Join Slack/i)).toBeInTheDocument();
    });
    
    const joinButton = screen.getByText(/Join Slack/i);
    await user.click(joinButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Slack Request Sent/i)).toBeInTheDocument();
    });
  });

  it('shows message when user is not found', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '2024-01-01T00:00:00Z',
    };
    
    const mockSession = {
      access_token: 'token',
      refresh_token: 'refresh',
      expires_in: 3600,
      expires_at: Date.now() / 1000 + 3600,
      token_type: 'bearer',
      user: mockUser,
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    
    vi.mocked(global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        success: false,
        message: 'User not found. Please complete the qualification form first.',
      }),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <SiliconValleyConsulting />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Join Slack/i)).toBeInTheDocument();
    });
    
    const joinButton = screen.getByText(/Join Slack/i);
    await user.click(joinButton);
    
    await waitFor(() => {
      expect(screen.getByText(/qualification form/i)).toBeInTheDocument();
    });
    
    // Should navigate after 3 seconds
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/social-qualify-form');
    }, { timeout: 4000 });
  });
});

