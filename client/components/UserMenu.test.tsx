import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserMenu } from './UserMenu';
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

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(supabase.auth.getSession).mockImplementation(() => new Promise(() => {}));
    
    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>
    );
    
    // Should show loading spinner
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows sign in button when user is not authenticated', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });

  it('shows user menu when authenticated', async () => {
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
      <AuthProvider>
        <UserMenu />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });

  it('opens sign in dialog when sign in button is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
    
    const signInButton = screen.getByText('Sign In');
    await user.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Enter your email to receive a magic link/i)).toBeInTheDocument();
    });
  });

  it('signs out when sign out is clicked', async () => {
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
    
    vi.mocked(supabase.auth.signOut).mockResolvedValue({
      error: null,
    });

    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });
    
    // Open dropdown menu
    const userButton = screen.getByText('test');
    await user.click(userButton);
    
    // Click sign out
    const signOutButton = screen.getByText(/Sign out/i);
    await user.click(signOutButton);
    
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});

