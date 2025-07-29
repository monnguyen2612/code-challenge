import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsPanel from '../components/SettingsPanel';

describe('SettingsPanel Component', () => {
  test('renders options and responds to callbacks', () => {
    const onSlippageChangeMock = vi.fn();
    const onCustomSlippageChangeMock = vi.fn();
    const onTxSpeedChangeMock = vi.fn();

    render(
      <SettingsPanel
        slippage={0.5}
        onSlippageChange={onSlippageChangeMock}
        customSlippage=""
        onCustomSlippageChange={onCustomSlippageChangeMock}
        txSpeed="standard"
        onTxSpeedChange={onTxSpeedChangeMock}
      />
    );

    // Verify header title
    expect(screen.getByText('Slippage Tolerance')).toBeInTheDocument();
    expect(screen.getByText('Transaction Speed')).toBeInTheDocument();

    // Click 1.0% slippage button
    const slipBtn = screen.getByTestId('slippage-btn-1');
    fireEvent.click(slipBtn);
    expect(onSlippageChangeMock).toHaveBeenCalledWith(1.0);
    expect(onCustomSlippageChangeMock).toHaveBeenCalledWith('');

    // Type in custom slippage input
    const customInput = screen.getByTestId('custom-slippage-input') as HTMLInputElement;
    fireEvent.change(customInput, { target: { value: '2.5' } });
    expect(onCustomSlippageChangeMock).toHaveBeenCalledWith('2.5');
    expect(onSlippageChangeMock).toHaveBeenCalledWith(2.5);

    // Click Fast transaction speed button
    const speedBtn = screen.getByTestId('speed-btn-fast');
    fireEvent.click(speedBtn);
    expect(onTxSpeedChangeMock).toHaveBeenCalledWith('fast');
  });
});
