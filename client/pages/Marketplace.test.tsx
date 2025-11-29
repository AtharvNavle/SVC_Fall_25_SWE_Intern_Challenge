import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Marketplace from './Marketplace';
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

describe('Marketplace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it('renders marketplace header', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Marketplace />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Company Marketplace/i)).toBeInTheDocument();
  });

  it('renders company cards', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Marketplace />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Silicon Valley Consulting/i)).toBeInTheDocument();
  });

  it('navigates to company page when available company is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AuthProvider>
          <Marketplace />
        </AuthProvider>
      </BrowserRouter>
    );
    
    await waitFor(() => {
      const companyCard = screen.getByText(/Silicon Valley Consulting/i).closest('div')?.parentElement;
      if (companyCard) {
        user.click(companyCard as HTMLElement);
      }
    });
    
    // Should navigate to company page
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('shows locked alert when locked company is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AuthProvider>
          <Marketplace />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Find a locked company (not Silicon Valley Consulting)
    const lockedCompanies = screen.getAllByText(/Tech Innovations Corp|Digital Marketing Pro/i);
    if (lockedCompanies.length > 0) {
      const lockedCard = lockedCompanies[0].closest('div')?.parentElement;
      if (lockedCard) {
        await user.click(lockedCard as HTMLElement);
        
        await waitFor(() => {
          expect(screen.getByText(/Company Locked/i)).toBeInTheDocument();
        });
      }
    }
  });

  it('renders how marketplace works section', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Marketplace />
        </AuthProvider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/How Our Marketplace Works/i)).toBeInTheDocument();
  });
});

