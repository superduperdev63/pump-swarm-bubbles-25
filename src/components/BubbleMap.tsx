
import React, { useState, useEffect, useMemo } from 'react';
import TokenBubble from './TokenBubble';
import { TokenData, TimeframeFilter, MarketCapFilter } from '@/lib/types';
import { generateMockTokens, filterTokensByTimeframe, filterTokensByMarketCap } from '@/lib/mock-data';

interface BubbleMapProps {
  onSelectToken: (token: TokenData) => void;
  timeframeFilter: TimeframeFilter;
  marketCapFilter: MarketCapFilter;
}

const BubbleMap: React.FC<BubbleMapProps> = ({ 
  onSelectToken, 
  timeframeFilter, 
  marketCapFilter 
}) => {
  const [tokens, setTokens] = useState<TokenData[]>([]);

  // Initial data generation
  useEffect(() => {
    const mockTokens = generateMockTokens(200);
    setTokens(mockTokens);
    
    // Periodically add a new token
    const interval = setInterval(() => {
      const newToken = generateMockTokens(1)[0];
      setTokens(prev => [...prev, newToken].slice(-300)); // Keep most recent 300 tokens
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Filter tokens based on selected filters
  const filteredTokens = useMemo(() => {
    let filtered = [...tokens];
    filtered = filterTokensByTimeframe(filtered, timeframeFilter);
    filtered = filterTokensByMarketCap(filtered, marketCapFilter);
    return filtered;
  }, [tokens, timeframeFilter, marketCapFilter]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      {filteredTokens.map((token, index) => (
        <TokenBubble 
          key={token.id} 
          token={token} 
          onClick={onSelectToken}
          index={index}
        />
      ))}
    </div>
  );
};

export default BubbleMap;
