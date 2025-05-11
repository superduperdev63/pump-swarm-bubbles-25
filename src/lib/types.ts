
export interface TokenData {
  id: string;
  name: string;
  ticker: string;
  logo: string;
  launchTimestamp: number;
  marketCap: number;
  price: number;
  volume24h: number;
  twitter?: string;
  telegram?: string;
  website?: string;
  pumpLink: string;
}

export type TimeframeFilter = 
  | '1h'
  | '2h'
  | '3h'
  | '6h'
  | '12h'
  | '24h'
  | '3d'
  | '7d';

export type MarketCapFilter =
  | '0-10k'
  | '10k-100k'
  | '100k-500k'
  | '500k-1M'
  | '1M+';
