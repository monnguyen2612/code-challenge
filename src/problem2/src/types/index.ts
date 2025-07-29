export interface TokenPrice {
  currency: string;
  date: string;
  price: number;
}

export type PriceMap = Record<string, number>;
