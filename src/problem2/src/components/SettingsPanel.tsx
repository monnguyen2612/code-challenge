import React from 'react';

interface SettingsPanelProps {
  slippage: number;
  onSlippageChange: (val: number) => void;
  customSlippage: string;
  onCustomSlippageChange: (val: string) => void;
  txSpeed: 'standard' | 'fast' | 'instant';
  onTxSpeedChange: (val: 'standard' | 'fast' | 'instant') => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  slippage,
  onSlippageChange,
  customSlippage,
  onCustomSlippageChange,
  txSpeed,
  onTxSpeedChange,
}) => {
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onCustomSlippageChange(val);
    const num = Number(val);
    if (!val || isNaN(num)) return;
    onSlippageChange(Math.min(50, Math.max(0.01, num)));
  };

  return (
    <div className="settings-panel" data-testid="settings-panel">
      <div>
        <p className="settings-section-title">Slippage Tolerance</p>
        <div className="slippage-options-grid">
          {[0.1, 0.5, 1.0].map((val) => (
            <button
              key={val}
              type="button"
              className={`slippage-btn ${slippage === val && !customSlippage ? 'active' : ''}`}
              onClick={() => {
                onSlippageChange(val);
                onCustomSlippageChange('');
              }}
              data-testid={`slippage-btn-${val}`}
            >
              {val}%
            </button>
          ))}
          <div className="custom-slippage-input-wrapper">
            <input
              type="text"
              placeholder="Custom"
              value={customSlippage}
              onChange={handleCustomChange}
              className="custom-slippage-input"
              data-testid="custom-slippage-input"
            />
            <span className="custom-slippage-percent-symbol">%</span>
          </div>
        </div>
      </div>

      <div>
        <p className="settings-section-title">Transaction Speed</p>
        <div className="speed-options-grid">
          {(['standard', 'fast', 'instant'] as const).map((speed) => (
            <button
              key={speed}
              type="button"
              className={`speed-btn ${txSpeed === speed ? 'active' : ''}`}
              onClick={() => onTxSpeedChange(speed)}
              data-testid={`speed-btn-${speed}`}
            >
              <span style={{ textTransform: 'capitalize' }}>{speed}</span>
              <span className="speed-badge">
                {speed === 'standard' ? '~15s' : speed === 'fast' ? '~5s' : '< 1s'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
