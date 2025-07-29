import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import App from '../App';

// Define the mock hook outputs
const mockUseTokenPrices = vi.fn();

vi.mock('../hooks/useTokenPrices', () => ({
  default: () => mockUseTokenPrices(),
  useTokenPrices: () => mockUseTokenPrices(),
}));

describe('Fancy Currency Swap - App Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default mock response: prices loaded successfully
    mockUseTokenPrices.mockReturnValue({
      prices: {
        ETH: 1650.00,
        USDC: 1.00,
        WBTC: 30000.00,
      },
      tokenList: ['ETH', 'USDC', 'WBTC'],
      isLoading: false,
      error: null,
    });
  });

  test('renders loading state when prices are fetching', () => {
    mockUseTokenPrices.mockReturnValue({
      prices: {},
      tokenList: [],
      isLoading: true,
      error: null,
    });

    render(<App />);
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText(/Loading token pricing database/i)).toBeInTheDocument();
  });

  test('renders error state when price fetching fails', () => {
    mockUseTokenPrices.mockReturnValue({
      prices: {},
      tokenList: [],
      isLoading: false,
      error: 'Network connectivity timed out',
    });

    render(<App />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText(/Network connectivity timed out/i)).toBeInTheDocument();
  });

  test('renders main swap interface successfully', () => {
    render(<App />);
    expect(screen.getByTestId('swap-app-container')).toBeInTheDocument();
    expect(screen.getByTestId('brand-logo')).toHaveTextContent('Swaps');
    expect(screen.getByTestId('connect-wallet-btn')).toHaveTextContent('Connect Wallet');
    expect(screen.getByTestId('swap-submit-btn')).toHaveTextContent('Connect Wallet');
  });

  test('wallet connection flow shows balances and enables form validations', () => {
    render(<App />);
    const connectBtn = screen.getByTestId('connect-wallet-btn');

    // Click to connect
    fireEvent.click(connectBtn);

    // Wallet is connected
    expect(screen.getByTestId('wallet-connected-badge')).toHaveTextContent('0x71C7...358f');
    expect(screen.getByTestId('swap-submit-btn')).toHaveTextContent('Confirm Swap');

    // Balance displays are visible
    expect(screen.getByTestId('balance-display-sell')).toHaveTextContent('Bal: 12.54');
    expect(screen.getByTestId('balance-display-buy')).toHaveTextContent('Bal: 2,500');

    // Click MAX button
    const maxBtn = screen.getByTestId('max-btn');
    fireEvent.click(maxBtn);

    // Sell input is set to balance
    const fromInput = screen.getByTestId('from-amount-input') as HTMLInputElement;
    expect(fromInput.value).toBe('12.54');
  });

  test('performs correct bidirectional currency swap calculations', async () => {
    render(<App />);
    
    // Connect wallet first
    fireEvent.click(screen.getByTestId('connect-wallet-btn'));

    const fromInput = screen.getByTestId('from-amount-input') as HTMLInputElement;
    const toInput = screen.getByTestId('to-amount-input') as HTMLInputElement;

    // Test 1: Typing Sell amount calculates Buy amount (2 ETH * 1650 = 3300 USDC)
    fireEvent.change(fromInput, { target: { value: '2' } });
    
    await waitFor(() => {
      expect(toInput.value).toBe('3300.00');
    });

    // Test 2: Typing Buy amount calculates Sell amount (1650 USDC / 1650 = 1 ETH)
    fireEvent.change(toInput, { target: { value: '1650' } });

    await waitFor(() => {
      expect(fromInput.value).toBe('1.00');
    });
  });

  test('handles balance validation and invalid amount validations', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('connect-wallet-btn'));

    const fromInput = screen.getByTestId('from-amount-input');

    // Test 1: Enter amount greater than balance (15 ETH > 12.54 ETH)
    fireEvent.change(fromInput, { target: { value: '15' } });
    expect(screen.getByTestId('validation-error')).toHaveTextContent('Insufficient balance');

    // Test 2: Enter zero or negative amount
    fireEvent.change(fromInput, { target: { value: '0' } });
    expect(screen.getByTestId('validation-error')).toHaveTextContent('Amount must be greater than zero');
  });

  test('toggling slippage settings menu works', () => {
    render(<App />);
    
    expect(screen.queryByTestId('settings-panel')).not.toBeInTheDocument();
    
    const settingsToggle = screen.getByTestId('settings-toggle-btn');
    fireEvent.click(settingsToggle);
    
    // Settings panel is open
    expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
    
    // Click a slippage option (1.0%)
    const slipBtn = screen.getByTestId('slippage-btn-1');
    fireEvent.click(slipBtn);
    
    // Custom slippage input
    const customSlip = screen.getByTestId('custom-slippage-input') as HTMLInputElement;
    fireEvent.change(customSlip, { target: { value: '2.5' } });
    expect(customSlip.value).toBe('2.5');
  });

  test('reverses swap direction correctly', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('connect-wallet-btn'));

    const fromInput = screen.getByTestId('from-amount-input');
    const toInput = screen.getByTestId('to-amount-input');

    // Select ETH -> USDC, type 2 ETH (3300 USDC)
    fireEvent.change(fromInput, { target: { value: '2' } });

    // Reverse direction
    const reverseBtn = screen.getByTestId('reverse-swap-btn');
    fireEvent.click(reverseBtn);

    // Selected tokens are inverted (Sell is now USDC, Buy is now ETH)
    // Values are also preserved/recalculated
    await waitFor(() => {
      expect(fromInput).toHaveValue(3300);
      expect(toInput).toHaveValue(2);
    });
  });

  test('successful swap submission renders a loading spinner and success toast', async () => {
    vi.useFakeTimers();
    render(<App />);
    
    // Setup state
    fireEvent.click(screen.getByTestId('connect-wallet-btn'));
    const fromInput = screen.getByTestId('from-amount-input');
    fireEvent.change(fromInput, { target: { value: '1' } });
    
    const form = screen.getByTestId('swap-form');
    fireEvent.submit(form);
    
    // Entering loading/swapping state
    expect(screen.getByTestId('swap-btn-loading')).toBeInTheDocument();
    expect(screen.getByText(/Processing Swap/i)).toBeInTheDocument();
    
    // Fast forward mock timer
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    // Form is submitted successfully
    expect(screen.queryByTestId('swap-btn-loading')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('toast-success').length).toBeGreaterThan(0);
    expect(screen.getByText(/Successfully swapped 1 ETH for 1650.00 USDC/i)).toBeInTheDocument();
    
    vi.useRealTimers();
  });

  test('blocks negative symbol and exponential characters on input keydown', () => {
    render(<App />);
    const fromInput = screen.getByTestId('from-amount-input');
    
    // Trigger keydown with '-'
    const eventMinus = fireEvent.keyDown(fromInput, { key: '-', code: 'Minus' });
    expect(eventMinus).toBe(false); // checks that preventDefault was triggered

    // Trigger keydown with 'e'
    const eventE = fireEvent.keyDown(fromInput, { key: 'e', code: 'KeyE' });
    expect(eventE).toBe(false); // checks that preventDefault was triggered
  });

  test('blocks negative values inputted via change events', () => {
    render(<App />);
    const fromInput = screen.getByTestId('from-amount-input') as HTMLInputElement;
    
    // Type positive value
    fireEvent.change(fromInput, { target: { value: '5' } });
    expect(fromInput.value).toBe('5');

    // Attempt to enter negative value
    fireEvent.change(fromInput, { target: { value: '-1' } });
    // Value remains '5' as the negative change is blocked
    expect(fromInput.value).toBe('5');
  });
});
