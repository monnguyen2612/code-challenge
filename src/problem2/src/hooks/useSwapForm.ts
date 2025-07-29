import { useState, useEffect, useMemo } from 'react';
import useTokenPrices from './useTokenPrices';

// Type definitions
export interface Toast {
  id: string;
  status: 'success' | 'error';
  title: string;
  message: string;
}

const mockBalances: Record<string, number> = {
  ETH: 12.54,
  USDC: 2500.00,
  WBTC: 0.35,
  LUNA: 1500.00,
  SWTH: 45000.00,
  ATOM: 120.50,
};

// Amount formatting helper
const formatAmount = (num: number): string => {
  if (num === 0) return '0.00';
  if (num < 0.000001) return num.toFixed(8);
  if (num < 0.001) return num.toFixed(6);
  if (num < 1) return num.toFixed(4);
  return num.toFixed(2);
};

export const useSwapForm = () => {
  const { prices, tokenList, isLoading: isLoadingPrices, error: apiError } = useTokenPrices();

  // Wallet states
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Form states
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);

  // UI state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Settings gear states
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState<number>(0.5); // Slippage Tolerance %
  const [customSlippage, setCustomSlippage] = useState('');
  const [txSpeed, setTxSpeed] = useState<'standard' | 'fast' | 'instant'>('standard');
  const [showDetails, setShowDetails] = useState(true);
  const [invertRate, setInvertRate] = useState(false);

  // Compute mock user balances
  const userFromBalance = useMemo(() => {
    if (!isWalletConnected) return 0;
    return mockBalances[fromToken] ?? 100.00;
  }, [fromToken, isWalletConnected]);

  const userToBalance = useMemo(() => {
    if (!isWalletConnected) return 0;
    return mockBalances[toToken] ?? 100.00;
  }, [toToken, isWalletConnected]);

  // Compute exchange rate
  const exchangeRate = useMemo(() => {
    if (!prices[fromToken] || !prices[toToken]) return null;
    return prices[fromToken] / prices[toToken];
  }, [prices, fromToken, toToken]);

  // Toast adder helper
  const addToast = (status: 'success' | 'error', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, status, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Connect/Disconnect Mock Wallet
  const toggleWalletConnection = () => {
    if (isWalletConnected) {
      setIsWalletConnected(false);
      setWalletAddress(null);
      setFromAmount('');
      setToAmount('');
      setValidationError(null);
      addToast('error', 'Wallet Disconnected', 'Your simulated Web3 wallet was disconnected.');
    } else {
      setIsWalletConnected(true);
      setWalletAddress('0x71C7...358f');
      addToast('success', 'Wallet Connected', 'Successfully connected simulated address 0x71C7...358f');
    }
  };

  // Recalculate output amounts when input changes (From -> To)
  useEffect(() => {
    if (activeField === 'from') {
      if (!fromAmount || isNaN(Number(fromAmount))) {
        setToAmount('');
        setValidationError(null);
        return;
      }

      const numericAmount = Number(fromAmount);
      if (numericAmount <= 0) {
        setToAmount('');
        setValidationError('Amount must be greater than zero');
        return;
      }

      // Balance validation
      if (isWalletConnected && numericAmount > userFromBalance) {
        setToAmount(exchangeRate ? formatAmount(numericAmount * exchangeRate) : '');
        setValidationError('Insufficient balance');
        return;
      }

      setValidationError(null);

      if (exchangeRate) {
        setToAmount(formatAmount(numericAmount * exchangeRate));
      }
    }
  }, [fromAmount, exchangeRate, userFromBalance, isWalletConnected, activeField]);

  // Recalculate input amounts when output changes (To -> From)
  useEffect(() => {
    if (activeField === 'to') {
      if (!toAmount || isNaN(Number(toAmount))) {
        setFromAmount('');
        setValidationError(null);
        return;
      }

      const numericAmount = Number(toAmount);
      if (numericAmount <= 0) {
        setFromAmount('');
        setValidationError('Amount must be greater than zero');
        return;
      }

      setValidationError(null);

      if (exchangeRate) {
        const calculatedFrom = numericAmount / exchangeRate;
        setFromAmount(formatAmount(calculatedFrom));

        // Balance validation on calculated amount
        if (isWalletConnected && calculatedFrom > userFromBalance) {
          setValidationError('Insufficient balance');
        }
      }
    }
  }, [toAmount, exchangeRate, userFromBalance, isWalletConnected, activeField]);

  // Re-compute when exchangeRate changes (token selector changes)
  useEffect(() => {
    if (exchangeRate) {
      if (activeField === 'from' && fromAmount) {
        const numericAmount = Number(fromAmount);
        if (numericAmount > 0) {
          setToAmount(formatAmount(numericAmount * exchangeRate));
        }
      } else if (activeField === 'to' && toAmount) {
        const numericAmount = Number(toAmount);
        if (numericAmount > 0) {
          setFromAmount(formatAmount(numericAmount / exchangeRate));
        }
      }
    }
  }, [exchangeRate]);

  // Handle Max Button Click
  const handleMaxClick = () => {
    if (!isWalletConnected) return;
    setActiveField('from');
    setFromAmount(userFromBalance.toString());
  };

  // Reverses swap direction
  const handleReverseSwap = () => {
    if (isSwapping) return;
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);

    // Swap amounts and update active field to keep math consistent
    if (activeField === 'from' && fromAmount) {
      setActiveField('to');
      setToAmount(fromAmount);
    } else if (activeField === 'to' && toAmount) {
      setActiveField('from');
      setFromAmount(toAmount);
    } else {
      setFromAmount('');
      setToAmount('');
    }
  };

  // Submits the simulated swap
  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSwapping) return;

    if (!isWalletConnected) {
      toggleWalletConnection();
      return;
    }

    // Run validations
    if (!fromAmount || isNaN(Number(fromAmount)) || Number(fromAmount) <= 0) {
      setValidationError('Please enter a valid amount');
      return;
    }

    if (Number(fromAmount) > userFromBalance) {
      setValidationError('Insufficient balance');
      return;
    }

    if (fromToken === toToken) {
      setValidationError('Source and destination tokens must be different');
      return;
    }

    setValidationError(null);
    setIsSwapping(true);

    // Simulate blockchain confirmation network latency
    const baseLatency = txSpeed === 'instant' ? 800 : txSpeed === 'fast' ? 1500 : 3000;
    
    setTimeout(() => {
      setIsSwapping(false);
      addToast(
        'success',
        'Transaction Settled',
        `Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}!`
      );
      
      // Clear inputs
      setFromAmount('');
      setToAmount('');
      setActiveField(null);
    }, baseLatency);
  };

  // Detailed computations for transaction breakdown
  const simulatedPriceImpact = useMemo(() => {
    if (!fromAmount || isNaN(Number(fromAmount))) return 0;
    const amountVal = Number(fromAmount);
    // Large swaps impact simulated liquidity pool price
    if (amountVal < 10) return 0.03;
    if (amountVal < 100) return 0.08;
    return Math.min(5.42, 0.08 + (amountVal * 0.002));
  }, [fromAmount]);

  const minimumReceived = useMemo(() => {
    if (!toAmount || isNaN(Number(toAmount))) return '0.00';
    const amountVal = Number(toAmount);
    return formatAmount(amountVal * (1 - slippage / 100));
  }, [toAmount, slippage]);

  const simulatedNetworkFee = useMemo(() => {
    const multiplier = txSpeed === 'instant' ? 2.5 : txSpeed === 'fast' ? 1.5 : 1.0;
    return (0.0003 * multiplier).toFixed(5);
  }, [txSpeed]);

  // Generate dynamic seed-based SVG chart coordinates
  const sparklineData = useMemo(() => {
    const codeSum = fromToken.charCodeAt(0) + toToken.charCodeAt(0);
    const isUp = codeSum % 2 === 0;
    const points: string[] = [];
    const width = 430;
    const count = 16;
    const segmentWidth = width / (count - 1);
    
    // Stable pseudo-random generator
    let seed = codeSum;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
    
    let current = isUp ? 55 : 45;
    const values: number[] = [];
    for (let i = 0; i < count; i++) {
      values.push(current);
      const drift = isUp ? -1.4 : 1.4;
      const noise = (random() - 0.5) * 11;
      current = Math.max(12, Math.min(88, current + drift + noise));
    }
    
    // Lock end values to trend
    values[count - 1] = isUp ? 22 : 78;
    
    values.forEach((val, idx) => {
      const x = idx * segmentWidth;
      const y = val;
      points.push(`${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    });
    
    return {
      path: points.join(' '),
      trend: isUp ? ('up' as const) : ('down' as const),
      percent: isUp ? `+${(2.1 + random() * 3).toFixed(2)}%` : `-${(1.2 + random() * 2).toFixed(2)}%`
    };
  }, [fromToken, toToken]);

  return {
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
    addToast,
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
  };
};

export default useSwapForm;
