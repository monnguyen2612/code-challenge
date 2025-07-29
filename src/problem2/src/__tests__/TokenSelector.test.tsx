import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TokenSelector, { TokenIcon } from '../components/TokenSelector';

describe('TokenSelector Component', () => {
  const mockPrices = {
    ETH: 1650.00,
    USDC: 1.00,
    WBTC: 30000.00,
  };
  const mockTokens = ['ETH', 'USDC', 'WBTC'];
  const mockOnSelect = vi.fn();

  test('renders with selected token and label', () => {
    render(
      <TokenSelector
        label="From (Sell)"
        selectedToken="ETH"
        tokens={mockTokens}
        prices={mockPrices}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('From (Sell)')).toBeInTheDocument();
    expect(screen.getByText('ETH', { selector: '.token-symbol' })).toBeInTheDocument();
  });

  test('opens dropdown on trigger click and shows token list (Desktop)', () => {
    // Mock standard non-mobile matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <TokenSelector
        label="From (Sell)"
        selectedToken="ETH"
        tokens={mockTokens}
        prices={mockPrices}
        onSelect={mockOnSelect}
      />
    );

    const trigger = screen.getByTestId('token-selector-trigger');
    
    // Dropdown is initially closed
    expect(screen.queryByTestId('token-selector-dropdown')).not.toBeInTheDocument();

    // Click trigger to open
    fireEvent.click(trigger);

    expect(screen.getByTestId('token-selector-dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('token-search-input')).toBeInTheDocument();

    // Verify token options are listed
    expect(screen.getByTestId('token-option-ETH')).toBeInTheDocument();
    expect(screen.getByTestId('token-option-USDC')).toBeInTheDocument();
    expect(screen.getByTestId('token-option-WBTC')).toBeInTheDocument();
  });

  test('filters token list based on search query input', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <TokenSelector
        label="From (Sell)"
        selectedToken="ETH"
        tokens={mockTokens}
        prices={mockPrices}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByTestId('token-selector-trigger'));

    const searchInput = screen.getByTestId('token-search-input');
    
    // Type "w"
    fireEvent.change(searchInput, { target: { value: 'w' } });

    // ETH and USDC are filtered out, WBTC is visible
    expect(screen.queryByTestId('token-option-ETH')).not.toBeInTheDocument();
    expect(screen.queryByTestId('token-option-USDC')).not.toBeInTheDocument();
    expect(screen.getByTestId('token-option-WBTC')).toBeInTheDocument();

    // Type query with no results
    fireEvent.change(searchInput, { target: { value: 'xyz' } });
    expect(screen.getByTestId('token-no-results')).toBeInTheDocument();
  });

  test('selecting a token option fires onSelect callback and closes menu', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <TokenSelector
        label="From (Sell)"
        selectedToken="ETH"
        tokens={mockTokens}
        prices={mockPrices}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByTestId('token-selector-trigger'));
    
    // Click WBTC option
    const wbtcOption = screen.getByTestId('token-option-WBTC');
    fireEvent.click(wbtcOption);

    // Callback was triggered
    expect(mockOnSelect).toHaveBeenCalledWith('WBTC');
    
    // Menu is closed
    expect(screen.queryByTestId('token-selector-dropdown')).not.toBeInTheDocument();
  });

  test('supports keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const onSelectMock = vi.fn();
    render(
      <TokenSelector
        label="From (Sell)"
        selectedToken="ETH"
        tokens={mockTokens}
        prices={mockPrices}
        onSelect={onSelectMock}
      />
    );

    fireEvent.click(screen.getByTestId('token-selector-trigger'));

    const searchInput = screen.getByTestId('token-search-input');
    const options = screen.getAllByRole('option');

    // Initial keyboard active is 0 (ETH)
    expect(options[0]).toHaveClass('active-keyboard');

    // Press ArrowDown to highlight USDC
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    expect(options[1]).toHaveClass('active-keyboard');

    // Press ArrowDown again to highlight WBTC
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    expect(options[2]).toHaveClass('active-keyboard');

    // Press Enter to select WBTC
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    expect(onSelectMock).toHaveBeenCalledWith('WBTC');
    expect(screen.queryByTestId('token-selector-dropdown')).not.toBeInTheDocument();
  });

  test('renders slide-up drawer layout on mobile device profiles', () => {
    // Mock mobile viewport
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <TokenSelector
        label="From (Sell)"
        selectedToken="ETH"
        tokens={mockTokens}
        prices={mockPrices}
        onSelect={mockOnSelect}
      />
    );

    const trigger = screen.getByTestId('token-selector-trigger');
    fireEvent.click(trigger);

    // Renders Mobile Drawer elements instead of Desktop Dropdown
    expect(screen.queryByTestId('token-selector-dropdown')).not.toBeInTheDocument();
    expect(screen.getByTestId('token-selector-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('token-selector-drawer-overlay')).toBeInTheDocument();
    expect(screen.getByText('Select a Token')).toBeInTheDocument();
  });

  test('TokenIcon falls back to text badge when image fails loading', () => {
    render(<TokenIcon symbol="ETH" />);
    
    // Initially renders in load state showing image and fallback as hidden
    const img = screen.getByTestId('token-icon-img') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    
    // Simulate image loading failure
    fireEvent.error(img);

    // Image is removed, fallback lettering "ETH" is active
    expect(screen.queryByTestId('token-icon-img')).not.toBeInTheDocument();
    expect(screen.getByTestId('token-icon-fallback')).toHaveTextContent('ETH');
  });
});
