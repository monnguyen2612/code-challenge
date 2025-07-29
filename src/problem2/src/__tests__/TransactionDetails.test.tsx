import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionDetails from '../components/TransactionDetails';

describe('TransactionDetails Component', () => {
  test('returns null if exchange rate is missing or identical tokens', () => {
    const { container } = render(
      <TransactionDetails
        fromToken="ETH"
        toToken="ETH"
        exchangeRate={1.0}
        minimumReceived="0"
        simulatedPriceImpact={0}
        simulatedNetworkFee="0"
        showDetails={true}
        onShowDetailsChange={vi.fn()}
        invertRate={false}
        onInvertRateChange={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders detail parameters and handles callbacks', () => {
    const onShowDetailsChangeMock = vi.fn();
    const onInvertRateChangeMock = vi.fn();

    render(
      <TransactionDetails
        fromToken="ETH"
        toToken="USDC"
        exchangeRate={1650.0}
        minimumReceived="1641.75"
        simulatedPriceImpact={0.03}
        simulatedNetworkFee="0.00030"
        showDetails={true}
        onShowDetailsChange={onShowDetailsChangeMock}
        invertRate={false}
        onInvertRateChange={onInvertRateChangeMock}
      />
    );

    // Verify rate values are rendered
    expect(screen.getByTestId('exchange-rate-details')).toHaveTextContent('1 ETH = 1650.00 USDC');
    expect(screen.getByTestId('detail-min-received')).toHaveTextContent('1641.75 USDC');
    expect(screen.getByTestId('detail-price-impact')).toHaveTextContent('0.03%');
    expect(screen.getByTestId('detail-network-fee')).toHaveTextContent('0.00030 ETH');

    // Click rate label to invert
    fireEvent.click(screen.getByTestId('exchange-rate-details'));
    expect(onInvertRateChangeMock).toHaveBeenCalledWith(true);

    // Click trigger row to collapse
    fireEvent.click(screen.getByTestId('details-trigger'));
    expect(onShowDetailsChangeMock).toHaveBeenCalledWith(false);
  });
});
