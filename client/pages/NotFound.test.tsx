import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from './NotFound';

// Mock console.error to avoid noise in test output
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('NotFound', () => {
  it('renders 404 message', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/Oops! Page not found/i)).toBeInTheDocument();
  });

  it('renders link to home page', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    const homeLink = screen.getByText(/Return to Home/i);
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('logs error when route is accessed', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    // The component logs on mount, so we check if it was called
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });
});

