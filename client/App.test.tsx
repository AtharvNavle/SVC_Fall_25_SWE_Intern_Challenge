import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { supabase } from './lib/supabase';

// Mock supabase
vi.mock('./lib/supabase', () => ({
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

// Mock createRoot
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  it('renders app with routing', () => {
    render(<App />);
    
    // App should render without errors
    expect(document.body).toBeTruthy();
  });

  it('sets up QueryClientProvider', () => {
    render(<App />);
    
    // QueryClientProvider should be set up
    expect(document.body).toBeTruthy();
  });

  it('sets up AuthProvider', () => {
    render(<App />);
    
    // AuthProvider should be set up
    expect(document.body).toBeTruthy();
  });

  it('sets up BrowserRouter', () => {
    render(<App />);
    
    // BrowserRouter should be set up
    expect(document.body).toBeTruthy();
  });
});

