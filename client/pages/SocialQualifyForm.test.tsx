import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SocialQualifyForm from './SocialQualifyForm';
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

describe('SocialQualifyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });
    
    // Mock fetch for API calls
    global.fetch = vi.fn();
  });

  it('renders form with all fields', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <SocialQualifyForm />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Check Your Account Eligibility/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reddit Username/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AuthProvider>
          <SocialQualifyForm />
        </AuthProvider>
      </BrowserRouter>
    );
    
    const submitButton = screen.getByText(/Submit Application/i);
    await user.click(submitButton);
    
    // HTML5 validation should prevent submission
    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput).toBeInvalid();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, userExists: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Application processed successfully',
          data: {
            matchedCompany: {
              name: 'Silicon Valley Consulting',
              slug: 'silicon-valley-consulting',
              payRate: '$2.00 per hour',
              bonus: '$500',
            },
          },
        }),
      });

    render(
      <BrowserRouter>
        <AuthProvider>
          <SocialQualifyForm />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Phone Number/i), '1234567890');
    await user.type(screen.getByLabelText(/Reddit Username/i), 'testuser');
    
    const submitButton = screen.getByText(/Submit Application/i);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Application Status Update/i)).toBeInTheDocument();
    });
  });

  it('shows error when user already exists', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, userExists: true }),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <SocialQualifyForm />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Phone Number/i), '1234567890');
    await user.type(screen.getByLabelText(/Reddit Username/i), 'testuser');
    
    const submitButton = screen.getByText(/Submit Application/i);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/already signed up/i)).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, userExists: false }),
    }).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ success: false, message: 'Reddit user does not exist' }),
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <SocialQualifyForm />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Phone Number/i), '1234567890');
    await user.type(screen.getByLabelText(/Reddit Username/i), 'invaliduser');
    
    const submitButton = screen.getByText(/Submit Application/i);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Reddit user does not exist/i)).toBeInTheDocument();
    });
  });

  it('navigates to company page on success', async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, userExists: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Application processed successfully',
          data: {
            matchedCompany: {
              name: 'Silicon Valley Consulting',
              slug: 'silicon-valley-consulting',
              payRate: '$2.00 per hour',
              bonus: '$500',
            },
          },
        }),
      });

    render(
      <BrowserRouter>
        <AuthProvider>
          <SocialQualifyForm />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Phone Number/i), '1234567890');
    await user.type(screen.getByLabelText(/Reddit Username/i), 'testuser');
    
    const submitButton = screen.getByText(/Submit Application/i);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Click here to learn more/i)).toBeInTheDocument();
    });
    
    const learnMoreButton = screen.getByText(/Click here to learn more/i);
    await user.click(learnMoreButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/companies/silicon-valley-consulting');
  });
});

