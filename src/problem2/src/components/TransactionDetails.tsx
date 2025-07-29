import React from 'react';

interface TransactionDetailsProps {
  fromToken: string;
  toToken: string;
  exchangeRate: number | null;
  minimumReceived: string;
  simulatedPriceImpact: number;
  simulatedNetworkFee: string;
  showDetails: boolean;
  onShowDetailsChange: (val: boolean) => void;
  invertRate: boolean;
  onInvertRateChange: (val: boolean) => void;
}

const formatAmount = (num: number): string => {
  if (num === 0) return '0.00';
  if (num < 0.000001) return num.toFixed(8);
  if (num < 0.001) return num.toFixed(6);
  if (num < 1) return num.toFixed(4);
  return num.toFixed(2);
};

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  fromToken,
  toToken,
  exchangeRate,
  minimumReceived,
  simulatedPriceImpact,
  simulatedNetworkFee,
  showDetails,
  onShowDetailsChange,
  invertRate,
  onInvertRateChange,
}) => {
  if (!exchangeRate || fromToken === toToken) return null;

  return (
    <div className={`details-accordion ${showDetails ? 'expanded' : ''}`} data-testid="details-accordion">
      <div
        className="details-trigger-row"
        onClick={() => onShowDetailsChange(!showDetails)}
        data-testid="details-trigger"
      >
        <div className="details-trigger-interactive">
          <span className="details-arrow">▼</span>
          <span>Transaction Breakdown</span>
        </div>
        <div
          className="details-rate-label"
          onClick={(e) => {
            e.stopPropagation();
            onInvertRateChange(!invertRate);
          }}
          data-testid="exchange-rate-details"
          title="Click to invert exchange rate"
        >
          {invertRate ? (
            `1 ${toToken} = ${formatAmount(1 / exchangeRate)} ${fromToken}`
          ) : (
            `1 ${fromToken} = ${formatAmount(exchangeRate)} ${toToken}`
          )}
        </div>
      </div>

      {showDetails && (
        <div className="details-drawer-content" data-testid="details-content">
          <div className="detail-row">
            <span className="detail-label-tooltip" title="The minimum assets you are guaranteed to receive after slippage tolerance controls.">
              Minimum Received ⓘ
            </span>
            <span className="detail-val" data-testid="detail-min-received">
              {minimumReceived} {toToken}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label-tooltip" title="Expected difference between market price and execution price due to simulated liquidity depth.">
              Price Impact ⓘ
            </span>
            <span className={`detail-val ${simulatedPriceImpact > 1.0 ? 'impact-high' : 'impact-low'}`} data-testid="detail-price-impact">
              {simulatedPriceImpact === 0 ? '< 0.01%' : `${simulatedPriceImpact.toFixed(2)}%`}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label-tooltip" title="Blockchain gas fees required to process transactions on-chain.">
              Network Fee ⓘ
            </span>
            <span className="detail-val" data-testid="detail-network-fee">
              ≈ {simulatedNetworkFee} ETH
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetails;
