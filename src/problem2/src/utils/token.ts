/**
 * Generates the raw GitHub URL for a token's SVG icon.
 * 
 * @param symbol The ticker symbol of the cryptocurrency (e.g. 'ETH', 'USDC').
 * @returns The absolute URL string of the SVG asset.
 */
export const getIconUrl = (symbol: string): string => {
  return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;
};
