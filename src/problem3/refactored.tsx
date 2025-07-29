import React, { useMemo } from 'react';

// ==========================================
// Ambient Declarations (to satisfy TS compiler)
// ==========================================
declare const useWalletBalances: () => WalletBalance[];
declare const usePrices: () => Record<string, number>;
declare const WalletRow: React.FC<{
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}>;
declare const classes: {
  row: string;
};


// ==========================================
// Typings & Interfaces
// ==========================================

interface BoxProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // Fixed: added missing blockchain property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {}

// ==========================================
// Externalized Helper Functions
// ==========================================

// Fixed: Moved getPriority outside the component to prevent it from being 
// recreated on every render. Added string typing instead of any.
const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis':
      return 100;
    case 'Ethereum':
      return 50;
    case 'Arbitrum':
      return 30;
    case 'Zilliqa':
      return 20;
    case 'Neo':
      return 20;
    default:
      return -99;
  }
};

// ==========================================
// Component Implementation
// ==========================================

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Combined filtering, sorting, and formatting into a single useMemo 
  // to avoid redundant mapping and rendering steps.
  // Fixed: Removed prices from the dependency array as prices are not used here.
  const processedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const priority = getPriority(balance.blockchain);
        // Fixed: Resolved undefined lhsPriority variable bug.
        // Fixed: Adjusted logic to keep positive balances (amount > 0) with a valid blockchain.
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // Fixed: Ensure a numeric value (including 0) is returned for stable sorting.
        return rightPriority - leftPriority;
      })
      .map((balance: WalletBalance): FormattedWalletBalance => {
        return {
          ...balance,
          formatted: balance.amount.toFixed(2), // Fixed: Formatted to fixed decimal place
        };
      });
  }, [balances]);

  const rows = processedBalances.map((balance: FormattedWalletBalance) => {
    // Fixed: Handle potential undefined price gracefully
    const price = prices[balance.currency] || 0;
    const usdValue = price * balance.amount;

    return (
      <WalletRow
        className={classes.row}
        key={balance.currency} // Fixed: Avoided using index as key; using currency as a stable unique key
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

export default WalletPage;
