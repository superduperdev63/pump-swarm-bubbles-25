
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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Track container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Initial data generation - more tokens for realism
  useEffect(() => {
    const mockTokens = generateMockTokens(150); // Generate more initial tokens
    setTokens(mockTokens);
    
    // Periodically add new tokens
    const interval = setInterval(() => {
      const newToken = generateMockTokens(1)[0];
      setTokens(prev => [...prev, newToken].slice(-300)); // Keep most recent 300 tokens
    }, 5000); // Every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Filter tokens based on selected filters
  const filteredTokens = useMemo(() => {
    let filtered = [...tokens];
    filtered = filterTokensByTimeframe(filtered, timeframeFilter);
    filtered = filterTokensByMarketCap(filtered, marketCapFilter);
    
    // If no tokens match the filters, generate some that would
    if (filtered.length < 5) {
      const newTokens = generateMockTokens(10, {
        timeframe: timeframeFilter,
        marketCapFilter: marketCapFilter
      });
      filtered = [...filtered, ...newTokens];
    }
    
    return filtered;
  }, [tokens, timeframeFilter, marketCapFilter]);

  // Assign positions to avoid overlaps using a basic algorithm
  const positionedTokens = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return [];
    
    return filteredTokens.map((token, index) => {
      // Create a position that's more random but avoids edges
      const paddingX = 80; // Padding from the edges
      const paddingY = 80;
      
      const x = paddingX + (Math.random() * (dimensions.width - (paddingX * 2)));
      const y = paddingY + (Math.random() * (dimensions.height - (paddingY * 2)));
      
      return {
        ...token,
        position: { x, y },
        entryDelay: index * 50, // Staggered entry delay (ms)
      };
    });
  }, [filteredTokens, dimensions]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-lg border border-white/10 bg-background/50"
    >
      {positionedTokens.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No tokens match the selected filters
        </div>
      ) : (
        positionedTokens.map((token, index) => (
          <TokenBubble 
            key={token.id} 
            token={token} 
            onClick={onSelectToken}
            index={index}
            position={token.position}
            entryDelay={token.entryDelay}
          />
        ))
      )}
    </div>
  );
};

export default BubbleMap;
