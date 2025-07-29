import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import useTokenPrices from '../hooks/useTokenPrices';

describe('useTokenPrices custom hook', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('successfully fetches and cleans token prices', async () => {
    const mockPricesData = [
      { currency: 'ETH', price: 1800.0, date: '2023-08-29T07:10:08.000Z' },
      { currency: 'USDC', price: 1.0, date: '2023-08-29T07:10:08.000Z' },
      { currency: 'WBTC', price: 26000.0, date: '2023-08-29T07:10:08.000Z' },
      { currency: 'BAD', price: 0, date: '2023-08-29T07:10:08.000Z' }, // Should be cleaned (filtered out)
    ];

    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPricesData),
      })
    );
    global.fetch = mockFetch as any;

    const { result } = renderHook(() => useTokenPrices());

    // Initially loading is true
    expect(result.current.isLoading).toBe(true);

    // Wait for the fetch resolution
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    
    // BAD is removed because price was 0
    expect(result.current.tokenList).toEqual(['ETH', 'USDC', 'WBTC']);
    expect(result.current.prices).toEqual({
      ETH: 1800.0,
      USDC: 1.0,
      WBTC: 26000.0,
    });
  });

  test('handles fetch API errors gracefully', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );
    global.fetch = mockFetch as any;

    const { result } = renderHook(() => useTokenPrices());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch pricing data');
  });
});
