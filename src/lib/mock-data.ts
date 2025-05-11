
import { TokenData } from './types';

const TOKEN_NAMES = [
  "PEPE", "DOGE", "SHIB", "FLOKI", "MFER", "NYAN", "WOJAK", "MOON", "PUMP", "BASED",
  "CHAD", "ELON", "BONK", "SAMO", "CAPYBARA", "BORK", "CAT", "RABBIT", "FROG", "APE",
  "SNEK", "PIXEL", "ALPHA", "BETA", "GAMMA", "DELTA", "EPSILON", "ZETA", "ETA", "THETA",
  "IOTA", "KAPPA", "LAMBDA", "MU", "NU", "XI", "OMICRON", "PI", "RHO", "SIGMA",
  "TAU", "UPSILON", "PHI", "CHI", "PSI", "OMEGA", "COPE", "WAGMI", "WEN", "GG",
  "MEME", "JOKE", "LMAO", "LOL", "ROFL", "HAHA", "FUNNY", "COMEDY", "GOLD", "HYPER"
];

const TOKEN_PREFIXES = ["$", "BABY", "KING", "SUPER", "MEGA", "MINI", "GIGA", "TURBO", ""];
const TOKEN_SUFFIXES = ["INU", "COIN", "TOKEN", "DAO", "FINANCE", "SWAP", "NETWORK", ""];

const LOGOS = [
  "https://placehold.co/200x200?text=LOGO1",
  "https://placehold.co/200x200?text=LOGO2",
  "https://placehold.co/200x200?text=LOGO3",
  "https://placehold.co/200x200?text=LOGO4",
  "https://placehold.co/200x200?text=LOGO5",
];

const GRADIENTS = ["purple", "blue", "pink", "green", "yellow"];

// Generate a random token name
function generateTokenName(): {name: string, ticker: string} {
  const usePrefix = Math.random() > 0.5;
  const useSuffix = Math.random() > 0.5;
  
  const baseName = TOKEN_NAMES[Math.floor(Math.random() * TOKEN_NAMES.length)];
  const prefix = usePrefix ? TOKEN_PREFIXES[Math.floor(Math.random() * TOKEN_PREFIXES.length)] : "";
  const suffix = useSuffix ? TOKEN_SUFFIXES[Math.floor(Math.random() * TOKEN_SUFFIXES.length)] : "";
  
  const name = `${prefix}${baseName}${suffix}`;
  const ticker = baseName.substring(0, 4);
  
  return { name, ticker };
}

// Generate a random market cap
function generateMarketCap(): number {
  // Generate distribution with more small caps than large caps
  const rand = Math.random();
  
  if (rand < 0.5) {
    // 50% chance for $0-$10K
    return Math.random() * 10000;
  } else if (rand < 0.8) {
    // 30% chance for $10K-$100K
    return 10000 + Math.random() * 90000;
  } else if (rand < 0.95) {
    // 15% chance for $100K-$500K
    return 100000 + Math.random() * 400000;
  } else if (rand < 0.98) {
    // 3% chance for $500K-$1M
    return 500000 + Math.random() * 500000;
  } else {
    // 2% chance for $1M+
    return 1000000 + Math.random() * 9000000;
  }
}

// Generate a random launch timestamp within the given timeframe
function generateLaunchTimestamp(maxHoursAgo: number): number {
  const now = Date.now();
  const hoursAgo = Math.random() * maxHoursAgo;
  return now - (hoursAgo * 60 * 60 * 1000);
}

// Generate a set of mock tokens
export function generateMockTokens(count: number = 100): TokenData[] {
  const tokens: TokenData[] = [];
  
  for (let i = 0; i < count; i++) {
    const { name, ticker } = generateTokenName();
    const marketCap = generateMarketCap();
    const launchTimestamp = generateLaunchTimestamp(168); // Up to 7 days ago (168 hours)
    const price = marketCap / (Math.random() * 1000000 + 100000); // Random supply
    const volume24h = marketCap * (Math.random() * 0.5 + 0.1); // 10-60% of market cap
    
    tokens.push({
      id: `token-${i}`,
      name,
      ticker,
      logo: LOGOS[Math.floor(Math.random() * LOGOS.length)],
      launchTimestamp,
      marketCap,
      price,
      volume24h,
      twitter: Math.random() > 0.3 ? `https://twitter.com/${ticker.toLowerCase()}` : undefined,
      telegram: Math.random() > 0.2 ? `https://t.me/${ticker.toLowerCase()}` : undefined,
      website: Math.random() > 0.7 ? `https://${ticker.toLowerCase()}.xyz` : undefined,
      pumpLink: `https://pump.fun/token/${ticker.toLowerCase()}`,
    });
  }
  
  return tokens;
}

// Filter tokens by timeframe
export function filterTokensByTimeframe(tokens: TokenData[], timeframe: string): TokenData[] {
  const now = Date.now();
  let cutoff: number;
  
  switch (timeframe) {
    case '1h':
      cutoff = now - (1 * 60 * 60 * 1000);
      break;
    case '2h':
      cutoff = now - (2 * 60 * 60 * 1000);
      break;
    case '3h':
      cutoff = now - (3 * 60 * 60 * 1000);
      break;
    case '6h':
      cutoff = now - (6 * 60 * 60 * 1000);
      break;
    case '12h':
      cutoff = now - (12 * 60 * 60 * 1000);
      break;
    case '24h':
      cutoff = now - (24 * 60 * 60 * 1000);
      break;
    case '3d':
      cutoff = now - (3 * 24 * 60 * 60 * 1000);
      break;
    case '7d':
      cutoff = now - (7 * 24 * 60 * 60 * 1000);
      break;
    default:
      cutoff = now - (1 * 60 * 60 * 1000); // Default to 1 hour
  }
  
  return tokens.filter(token => token.launchTimestamp >= cutoff);
}

// Filter tokens by market cap
export function filterTokensByMarketCap(tokens: TokenData[], marketCapFilter: string): TokenData[] {
  switch (marketCapFilter) {
    case '0-10k':
      return tokens.filter(token => token.marketCap >= 0 && token.marketCap < 10000);
    case '10k-100k':
      return tokens.filter(token => token.marketCap >= 10000 && token.marketCap < 100000);
    case '100k-500k':
      return tokens.filter(token => token.marketCap >= 100000 && token.marketCap < 500000);
    case '500k-1M':
      return tokens.filter(token => token.marketCap >= 500000 && token.marketCap < 1000000);
    case '1M+':
      return tokens.filter(token => token.marketCap >= 1000000);
    default:
      return tokens;
  }
}

// Get a color gradient for a token based on its id
export function getTokenGradient(token: TokenData): string {
  const index = parseInt(token.id.split('-')[1], 10) % GRADIENTS.length;
  return GRADIENTS[index];
}

// Format market cap for display
export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1000000) {
    return `$${(marketCap / 1000000).toFixed(2)}M`;
  } else if (marketCap >= 1000) {
    return `$${(marketCap / 1000).toFixed(1)}K`;
  } else {
    return `$${Math.round(marketCap)}`;
  }
}

// Format price for display
export function formatPrice(price: number): string {
  if (price < 0.000001) {
    return `$${price.toExponential(2)}`;
  } else if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  } else {
    return `$${price.toFixed(4)}`;
  }
}

// Format volume for display
export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(2)}M`;
  } else if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(1)}K`;
  } else {
    return `$${Math.round(volume)}`;
  }
}

// Calculate bubble size based on market cap
export function calculateBubbleSize(marketCap: number): number {
  // Min size: 8px, Max size: 100px
  if (marketCap < 10000) {
    return 10 + (marketCap / 10000) * 20; // 10-30px
  } else if (marketCap < 100000) {
    return 30 + ((marketCap - 10000) / 90000) * 20; // 30-50px
  } else if (marketCap < 500000) {
    return 50 + ((marketCap - 100000) / 400000) * 20; // 50-70px
  } else if (marketCap < 1000000) {
    return 70 + ((marketCap - 500000) / 500000) * 10; // 70-80px
  } else {
    return 80 + (Math.min(marketCap - 1000000, 9000000) / 9000000) * 20; // 80-100px
  }
}

// Generate point data for a simple sparkline chart
export function generateSparklineData(points: number = 24): number[] {
  const data: number[] = [];
  let lastValue = Math.random() * 100;
  
  for (let i = 0; i < points; i++) {
    // Random walk with momentum
    const change = (Math.random() - 0.48) * 10; // Slight upward bias
    lastValue = Math.max(0, lastValue + change);
    data.push(lastValue);
  }
  
  return data;
}
