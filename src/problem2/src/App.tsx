import React from 'react';
import TokenSelector from './components/TokenSelector';
import SettingsPanel from './components/SettingsPanel';
import TransactionDetails from './components/TransactionDetails';
import PriceTrendChart from './components/PriceTrendChart';
import ToastOverlay from './components/ToastOverlay';
import useSwapForm from './hooks/useSwapForm';

function App() {
  const {
    prices,
    tokenList,
    isLoadingPrices,
    apiError,
    isWalletConnected,
    walletAddress,
    toggleWalletConnection,
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    fromAmount,
    setFromAmount,
    toAmount,
    setToAmount,
    setActiveField,
    validationError,
    setValidationError,
    isSwapping,
    toasts,
    removeToast,
    showSettings,
    setShowSettings,
    slippage,
    setSlippage,
    customSlippage,
    setCustomSlippage,
    txSpeed,
    setTxSpeed,
    showDetails,
    setShowDetails,
    invertRate,
    setInvertRate,
    userFromBalance,
    userToBalance,
    handleMaxClick,
    handleReverseSwap,
    handleSwapSubmit,
    simulatedPriceImpact,
    minimumReceived,
    simulatedNetworkFee,
    sparklineData,
    exchangeRate,
  } = useSwapForm();

  // Prevent typing negative values or exponent 'e' characters
  const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  if (isLoadingPrices) {
    return (
      <div className="app-container" data-testid="loading-state">
        <div className="swap-card loading-state">
          <div className="spinner"></div>
          <p className="loading-text">Loading token pricing database...</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="app-container" data-testid="error-state">
        <div className="swap-card error-card">
          <h2 className="error-title">Connection Error</h2>
          <p className="error-desc">{apiError}</p>
          <button onClick={() => window.location.reload()} className="retry-btn" data-testid="retry-btn">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" data-testid="swap-app-container">
      {/* Top Application Bar */}
      <header className="app-header">
        <div className="brand-wrapper">
          <span className="brand-logo" data-testid="brand-logo">Δ Swaps</span>
        </div>
        {isWalletConnected ? (
          <button 
            type="button" 
            className="wallet-connected-badge" 
            onClick={toggleWalletConnection}
            title="Click to disconnect"
            data-testid="wallet-connected-badge"
          >
            <span className="wallet-indicator-dot"></span>
            {walletAddress}
          </button>
        ) : (
          <button 
            type="button" 
            className="connect-wallet-btn" 
            onClick={toggleWalletConnection}
            data-testid="connect-wallet-btn"
          >
            Connect Wallet
          </button>
        )}
      </header>

      {/* Main Core Swap Card */}
      <div className="swap-card" data-testid="swap-card">
        <div className="card-header">
          <div className="title-section">
            <h1 className="title">Currency Swap</h1>
            <p className="description">Instantly exchange crypto with zero slippage</p>
          </div>
          <button
            type="button"
            className="settings-toggle-btn"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Transaction Settings"
            data-testid="settings-toggle-btn"
          >
            ⚙️
          </button>
        </div>

        {/* Gear Settings Slidedown */}
        {showSettings && (
          <SettingsPanel
            slippage={slippage}
            onSlippageChange={setSlippage}
            customSlippage={customSlippage}
            onCustomSlippageChange={setCustomSlippage}
            txSpeed={txSpeed}
            onTxSpeedChange={setTxSpeed}
          />
        )}

        <form className="swap-form" onSubmit={handleSwapSubmit} data-testid="swap-form">
          {/* Sell Input Card */}
          <div className="swap-input-card" data-testid="sell-input-card">
            <div className="input-card-header">
              <TokenSelector
                label="From (Sell)"
                selectedToken={fromToken}
                tokens={tokenList}
                prices={prices}
                onSelect={(tok) => {
                  setFromToken(tok);
                  setValidationError(null);
                }}
                disabled={isSwapping}
              />
              <div className="balance-display-wrapper" data-testid="balance-display-sell">
                <span>Bal: {isWalletConnected ? userFromBalance.toLocaleString() : '0.00'}</span>
                {isWalletConnected && userFromBalance > 0 && (
                  <button
                    type="button"
                    className="max-badge-btn"
                    onClick={handleMaxClick}
                    data-testid="max-btn"
                  >
                    MAX
                  </button>
                )}
              </div>
            </div>
            
            <div className="amount-input-row">
              <input
                id="input-amount"
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                placeholder="0.00"
                value={fromAmount}
                onKeyDown={preventNegativeInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (Number(val) < 0) return;
                  setActiveField('from');
                  setFromAmount(val);
                }}
                disabled={isSwapping}
                className="amount-input"
                required
                data-testid="from-amount-input"
              />
            </div>
            {fromAmount && prices[fromToken] && !isNaN(Number(fromAmount)) && (
              <div className="usd-value-sub" data-testid="usd-value-sell">
                ≈ ${(Number(fromAmount) * prices[fromToken]).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
              </div>
            )}
          </div>

          {/* Swap Reversal Separator */}
          <div className="divider-wrapper">
            <button
              type="button"
              className="reverse-btn"
              onClick={handleReverseSwap}
              disabled={isSwapping}
              title="Swap token directions"
              data-testid="reverse-swap-btn"
            >
              ⇅
            </button>
          </div>

          {/* Buy Input Card */}
          <div className="swap-input-card" data-testid="buy-input-card">
            <div className="input-card-header">
              <TokenSelector
                label="To (Buy)"
                selectedToken={toToken}
                tokens={tokenList}
                prices={prices}
                onSelect={(tok) => {
                  setToToken(tok);
                  setValidationError(null);
                }}
                disabled={isSwapping}
              />
              <div className="balance-display-wrapper" data-testid="balance-display-buy">
                <span>Bal: {isWalletConnected ? userToBalance.toLocaleString() : '0.00'}</span>
              </div>
            </div>

            <div className="amount-input-row">
              <input
                id="output-amount"
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                placeholder="0.00"
                value={toAmount}
                onKeyDown={preventNegativeInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (Number(val) < 0) return;
                  setActiveField('to');
                  setToAmount(val);
                }}
                disabled={isSwapping}
                className="amount-input"
                data-testid="to-amount-input"
              />
            </div>
            {toAmount && prices[toToken] && !isNaN(Number(toAmount)) && (
              <div className="usd-value-sub" data-testid="usd-value-buy">
                ≈ ${(Number(toAmount) * prices[toToken]).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
              </div>
            )}
          </div>

          {/* DeFi Accordion Breakdown */}
          <TransactionDetails
            fromToken={fromToken}
            toToken={toToken}
            exchangeRate={exchangeRate}
            minimumReceived={minimumReceived}
            simulatedPriceImpact={simulatedPriceImpact}
            simulatedNetworkFee={simulatedNetworkFee}
            showDetails={showDetails}
            onShowDetailsChange={setShowDetails}
            invertRate={invertRate}
            onInvertRateChange={setInvertRate}
          />

          {/* Error and Validation Display */}
          {validationError && (
            <div className="validation-error-banner" data-testid="validation-error">
              ⚠️ {validationError}
            </div>
          )}

          {/* Action Submission Button */}
          <button
            type="submit"
            className="swap-button"
            disabled={isSwapping || (isWalletConnected && (!!validationError || !fromAmount))}
            data-testid="swap-submit-btn"
          >
            {isSwapping ? (
              <span className="btn-loading-wrapper" data-testid="swap-btn-loading">
                <span className="btn-spinner"></span>
                Processing Swap...
              </span>
            ) : !isWalletConnected ? (
              'Connect Wallet'
            ) : (
              'Confirm Swap'
            )}
          </button>
        </form>
      </div>

      {/* SVG Historical Price Trend Card */}
      <PriceTrendChart
        fromToken={fromToken}
        toToken={toToken}
        sparklineData={sparklineData}
      />

      {/* Transactions Stacked Toast Notification Overlay */}
      <ToastOverlay
        toasts={toasts}
        onRemoveToast={removeToast}
      />
    </div>
  );
}

export default App;
