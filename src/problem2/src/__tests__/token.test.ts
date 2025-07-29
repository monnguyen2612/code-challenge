import { describe, test, expect } from 'vitest';
import { getIconUrl } from '../utils/token';

describe('token utility', () => {
  test('generates correct raw GitHub URL for token SVG icons', () => {
    expect(getIconUrl('ETH')).toBe('https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/ETH.svg');
    expect(getIconUrl('USDC')).toBe('https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/USDC.svg');
    expect(getIconUrl('BTC')).toBe('https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/BTC.svg');
  });
});
