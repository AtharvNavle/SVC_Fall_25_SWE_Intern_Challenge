import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MagicLinkAuth } from './MagicLinkAuth';
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

describe('MagicLinkAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it('renders sign in form', () => {
    render(
      <AuthProvider>
        <MagicLinkAuth />
      </AuthProvider>
    );
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByText(/Send Magic Link/i)).toBeInTheDocument();
  });

  it('shows error when email is empty', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <MagicLinkAuth />
      </AuthProvider>
    );
    
    const submitButton = screen.getByText(/Send Magic Link/i);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter your email address/i)).toBeInTheDocument();
    });
  });

  it('sends magic link on valid email', async () => {
    const user = userEvent.setup();
    vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });

    render(
      <AuthProvider>
        <MagicLinkAuth />
      </AuthProvider>
    );
    
    const emailInput = screen.getByPlaceholderText('your@email.com');
    const submitButton = screen.getByText(/Send Magic Link/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Check Your Email/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });
    
    expect(supabase.auth.signInWithOtp).toHaveBeenCalled();
  });

  it('shows error message on auth failure', async () => {
    const user = userEvent.setup();
    vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid email', status: 400 } as any,
    });

    render(
      <AuthProvider>
        <MagicLinkAuth />
      </AuthProvider>
    );
    
    const emailInput = screen.getByPlaceholderText('your@email.com');
    const submitButton = screen.getByText(/Send Magic Link/i);
    
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid email/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when provided', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(
      <AuthProvider>
        <MagicLinkAuth onClose={onClose} />
      </AuthProvider>
    );
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('allows sending another link', async () => {
    const user = userEvent.setup();
    vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });

    render(
      <AuthProvider>
        <MagicLinkAuth />
      </AuthProvider>
    );
    
    const emailInput = screen.getByPlaceholderText('your@email.com');
    const submitButton = screen.getByText(/Send Magic Link/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Check Your Email/i)).toBeInTheDocument();
    });
    
    const sendAnotherButton = screen.getByText(/Send Another Link/i);
    await user.click(sendAnotherButton);
    
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
  });
});

