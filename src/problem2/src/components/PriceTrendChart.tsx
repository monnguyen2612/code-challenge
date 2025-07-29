import React from 'react';

interface PriceTrendChartProps {
  fromToken: string;
  toToken: string;
  sparklineData: {
    path: string;
    trend: 'up' | 'down';
    percent: string;
  };
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  fromToken,
  toToken,
  sparklineData,
}) => {
  if (fromToken === toToken) return null;

  return (
    <div className="chart-container-wrapper" data-testid="price-chart">
      <div className="chart-header">
        <h4 className="chart-pair-title">{fromToken} / {toToken} Price Trend (24h)</h4>
        <span className={`chart-trend-badge ${sparklineData.trend}`} data-testid="chart-trend-badge">
          {sparklineData.percent} {sparklineData.trend === 'up' ? '↗' : '↘'}
        </span>
      </div>
      <svg className="svg-chart-frame" viewBox="0 0 430 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkline-grad-up" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sparkline-grad-down" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Shaded Area Chart */}
        <path
          d={`${sparklineData.path} L 430 100 L 0 100 Z`}
          fill={sparklineData.trend === 'up' ? 'url(#sparkline-grad-up)' : 'url(#sparkline-grad-down)'}
        />
        {/* Line Chart */}
        <path
          className={`sparkline-path ${sparklineData.trend}`}
          d={sparklineData.path}
          data-testid="chart-sparkline-path"
        />
      </svg>
      <div className="chart-timeline-labels">
        <span>24 Hours Ago</span>
        <span>12h Ago</span>
        <span>Live Price</span>
      </div>
    </div>
  );
};

export default PriceTrendChart;
