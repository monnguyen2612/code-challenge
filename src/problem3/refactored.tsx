import React, { useMemo } from 'react';

// Improved type definitions
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: BlockchainType;
}

interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
  blockchain: BlockchainType;
  usdValue: number;
}

type BlockchainType = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface Props {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}

// Custom hooks (assumed to be implemented elsewhere)
const useWalletBalances = (): WalletBalance[] => {
  // Implementation would go here
  return [];
};

const usePrices = (): Record<string, number> => {
  // Implementation would go here
  return {};
};

// Improved priority function with proper typing
const getPriority = (blockchain: BlockchainType): number => {
  const priorityMap: Record<BlockchainType, number> = {
    'Osmosis': 100,
    'Ethereum': 50,
    'Arbitrum': 30,
    'Zilliqa': 20,
    'Neo': 20,
  };
  
  return priorityMap[blockchain] ?? -99;
};

// Utility function for safe price calculation
const calculateUsdValue = (amount: number, currency: string, prices: Record<string, number>): number => {
  const price = prices[currency];
  if (price === undefined || price === null) {
    console.warn(`Price not found for currency: ${currency}`);
    return 0;
  }
  return amount * price;
};

const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props;
  
  // Data fetching with error handling
  const balances = useWalletBalances();
  const prices = usePrices();
  
  // Memoized processing of balances
  const processedBalances = useMemo(() => {
    if (!balances || !prices) {
      return [];
    }
    
    return balances
      .filter((balance: WalletBalance) => {
        // Fix: Keep positive balances and check if blockchain is valid
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        
        // Fix: Proper sorting with all return cases
        if (leftPriority > rightPriority) {
          return -1;
        } else if (rightPriority > leftPriority) {
          return 1;
        }
        return 0; // Equal priorities
      })
      .map((balance: WalletBalance): FormattedWalletBalance => {
        const usdValue = calculateUsdValue(balance.amount, balance.currency, prices);
        
        return {
          ...balance,
          formatted: balance.amount.toFixed(2),
          usdValue,
        };
      });
  }, [balances, prices]); // Fix: Only include actually used dependencies
  
  // Memoized rows generation
  const rows = useMemo(() => {
    return processedBalances.map((balance: FormattedWalletBalance) => (
      <WalletRow 
        className="wallet-row"
        key={`${balance.blockchain}-${balance.currency}-${balance.amount}`} // Fix: Use unique key instead of index
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formatted}
      />
    ));
  }, [processedBalances]);
  
  // Error state handling
  if (!balances || balances.length === 0) {
    return (
      <div {...rest}>
        <p>No wallet balances available</p>
      </div>
    );
  }
  
  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

// WalletRow component (assumed to be implemented elsewhere)
interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

const WalletRow: React.FC<WalletRowProps> = ({ className, amount, usdValue, formattedAmount }) => {
  return (
    <div className={className}>
      <span>Amount: {formattedAmount}</span>
      <span>USD Value: ${usdValue.toFixed(2)}</span>
    </div>
  );
};

export default WalletPage; 