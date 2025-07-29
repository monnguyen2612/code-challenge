import { useState, useEffect } from 'react';
import { TokenPrice, PriceMap } from '../types';

/**
 * Custom React hook to fetch, clean up (deduplicate), and list token prices 
 * from the interview pricing endpoint.
 */
export const useTokenPrices = () => {
  const [prices, setPrices] = useState<PriceMap>({});
  const [tokenList, setTokenList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch('https://interview.switcheo.com/prices.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch pricing data');
        return res.json();
      })
      .then((data: TokenPrice[]) => {
        const priceMap: PriceMap = {};
        
        // Clean and deduplicate prices
        data.forEach((item) => {
          if (item.price && item.price > 0) {
            priceMap[item.currency] = item.price;
          }
        });

        // Ensure default fallback currencies are populated if missing
        if (!priceMap['ETH']) priceMap['ETH'] = 1645.93;
        if (!priceMap['USDC']) priceMap['USDC'] = 1.0;

        const sortedTokens = Object.keys(priceMap).sort();
        
        setPrices(priceMap);
        setTokenList(sortedTokens);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'An error occurred while loading token prices.');
        setIsLoading(false);
      });
  }, []);

  return { prices, tokenList, isLoading, error };
};
export default useTokenPrices;
