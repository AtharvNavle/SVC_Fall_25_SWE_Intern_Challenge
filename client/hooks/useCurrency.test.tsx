import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCurrency } from './useCurrency';

describe('useCurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with USD default currency', () => {
    const { result } = renderHook(() => useCurrency());
    
    expect(result.current.currency.code).toBe('USD');
    expect(result.current.currency.symbol).toBe('$');
    expect(result.current.currency.rate).toBe(1);
    expect(result.current.currencyLoading).toBe(true);
  });

  it('formats currency correctly', async () => {
    const { result } = renderHook(() => useCurrency());
    
    await waitFor(() => {
      expect(result.current.currencyLoading).toBe(false);
    });
    
    const formatted = result.current.formatCurrency(100);
    expect(formatted).toBe('$100.00');
  });

  it('handles API errors gracefully', async () => {
    // Mock fetch to fail
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useCurrency());
    
    await waitFor(() => {
      expect(result.current.currencyLoading).toBe(false);
    });
    
    // Should fall back to USD
    expect(result.current.currency.code).toBe('USD');
    expect(result.current.currency.symbol).toBe('$');
    expect(result.current.currency.rate).toBe(1);
  });

  it('handles timeout errors', async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      const error = new Error('Timeout');
      error.name = 'AbortError';
      return Promise.reject(error);
    });
    
    const { result } = renderHook(() => useCurrency());
    
    await waitFor(() => {
      expect(result.current.currencyLoading).toBe(false);
    });
    
    // Should fall back to USD
    expect(result.current.currency.code).toBe('USD');
  });
});

