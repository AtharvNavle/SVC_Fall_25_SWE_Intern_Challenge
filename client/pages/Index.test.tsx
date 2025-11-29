import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Index from './Index';
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

describe('Index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it('renders hero section', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Index />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Get Paid When AI Companies/i)).toBeInTheDocument();
    expect(screen.getByText(/See if your accounts qualify/i)).toBeInTheDocument();
  });

  it('renders platform payment rates section', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Index />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Platform Payment Rates/i)).toBeInTheDocument();
    expect(screen.getByText(/Twitter/i)).toBeInTheDocument();
    expect(screen.getByText(/Reddit/i)).toBeInTheDocument();
  });

  it('navigates to form when CTA button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AuthProvider>
          <Index />
        </AuthProvider>
      </BrowserRouter>
    );
    
    const ctaButton = screen.getAllByText(/See if your accounts qualify/i)[0];
    await user.click(ctaButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/social-qualify-form');
  });

  it('scrolls to platforms section when Learn More is clicked', async () => {
    const user = userEvent.setup();
    const scrollIntoViewMock = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoViewMock;
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <Index />
        </AuthProvider>
      </BrowserRouter>
    );
    
    const learnMoreButton = screen.getByText(/Learn More/i);
    await user.click(learnMoreButton);
    
    expect(scrollIntoViewMock).toHaveBeenCalled();
  });

  it('renders how it works section', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Index />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/How FairDataUse Works/i)).toBeInTheDocument();
    expect(screen.getByText(/Connect Accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/Monitor Usage/i)).toBeInTheDocument();
    expect(screen.getByText(/Get Paid/i)).toBeInTheDocument();
  });

  it('shows marketplace link when user is authenticated', async () => {
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
          <Index />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Companies/i)).toBeInTheDocument();
    });
  });
});

