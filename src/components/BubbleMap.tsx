import React, { useState, useEffect, useRef, useMemo } from 'react';
import TokenBubble from './TokenBubble';
import { TokenData, TimeframeFilter, MarketCapFilter } from '@/lib/types';
import { generateMockTokens, filterTokensByTimeframe, filterTokensByMarketCap, calculateBubbleSize } from '@/lib/mock-data';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const animationRef = useRef<number | null>(null);
  const physicsEnabled = useRef<boolean>(true);

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

  // Initial data generation - creating a stable ecosystem
  useEffect(() => {
    const mockTokens = generateMockTokens(100);
    
    // Initialize positions randomly across the full canvas
    const initializedTokens = mockTokens.map((token, index) => {
      const size = calculateBubbleSize(token.marketCap);
      const padding = Math.max(size, 40); // Minimum padding from edges
      
      return {
        ...token,
        position: {
          x: padding + (Math.random() * (dimensions.width - padding * 2)),
          y: padding + (Math.random() * (dimensions.height - padding * 2)),
        },
        entryDelay: index * 30, // Staggered entry
        velocity: { x: 0, y: 0 },
      };
    });
    
    setTokens(initializedTokens);
    
    // Periodically add new tokens from the left edge
    const interval = setInterval(() => {
      if (tokens.length < 300) { // Cap at 300 tokens for performance
        const newToken = generateMockTokens(1)[0];
        const size = calculateBubbleSize(newToken.marketCap);
        
        setTokens(prev => [
          ...prev, 
          {
            ...newToken,
            position: {
              x: 10, // Start at the left edge
              y: Math.random() * (dimensions.height - size * 2) + size,
            },
            entryDelay: 0,
            velocity: { x: 0, y: 0 },
          }
        ]);
      }
    }, 8000); // Add a new token every 8 seconds
    
    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  // Periodically update some token market caps to simulate market activity
  useEffect(() => {
    const interval = setInterval(() => {
      if (tokens.length > 0) {
        setTokens(prev => {
          return prev.map(token => {
            // 10% chance to update any given token
            if (Math.random() > 0.9) {
              const changePercent = (Math.random() - 0.45) * 0.2; // -5% to +5% change
              const newMarketCap = Math.max(100, token.marketCap * (1 + changePercent));
              
              return {
                ...token,
                marketCap: newMarketCap,
                price: token.price * (1 + changePercent),
              };
            }
            return token;
          });
        });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [tokens]);

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
      
      // Initialize positions for new tokens
      const initializedNewTokens = newTokens.map((token, index) => {
        const size = calculateBubbleSize(token.marketCap);
        
        return {
          ...token,
          position: {
            x: 10, // Start at left edge
            y: Math.random() * (dimensions.height - size * 2) + size,
          },
          entryDelay: index * 30,
          velocity: { x: 0, y: 0 },
        };
      });
      
      filtered = [...filtered, ...initializedNewTokens];
    }
    
    return filtered;
  }, [tokens, timeframeFilter, marketCapFilter, dimensions]);

  // Physics simulation for bubble repulsion
  useEffect(() => {
    if (filteredTokens.length === 0 || !dimensions.width) return;
    
    // Define the sidebar safety zone
    const sidebarWidth = selectedToken ? 320 : 0; // Assuming sidebar width is 320px
    const safeWidth = dimensions.width - sidebarWidth;

    const applyPhysics = () => {
      if (!physicsEnabled.current) {
        animationRef.current = requestAnimationFrame(applyPhysics);
        return;
      }
      
      setTokens(currentTokens => {
        // Map current tokens to their filtered versions to apply physics only to visible tokens
        const tokenMap = new Map<string, TokenData>();
        currentTokens.forEach(token => tokenMap.set(token.id, token));
        
        // Process physics for each filtered token
        filteredTokens.forEach(token => {
          const tokenSize = calculateBubbleSize(token.marketCap);
          if (!token.position || token.fixed) return;
          
          let fx = 0;
          let fy = 0;
          
          // Repulsion between tokens
          filteredTokens.forEach(otherToken => {
            if (token.id === otherToken.id || !otherToken.position) return;
            
            const dx = token.position!.x - otherToken.position.x;
            const dy = token.position!.y - otherToken.position.y;
            const distSq = dx * dx + dy * dy;
            const otherSize = calculateBubbleSize(otherToken.marketCap);
            const minDist = tokenSize / 2 + otherSize / 2 + 5; // 5px padding between bubbles
            
            // Apply repulsion if tokens are too close
            if (distSq < minDist * minDist && distSq > 0) {
              const dist = Math.sqrt(distSq);
              const force = 0.05 * (minDist - dist) / dist;
              fx += dx * force;
              fy += dy * force;
            }
          });
          
          // Boundary forces - keep within container and respect sidebar
          const boundaryForce = 0.1;
          const padding = tokenSize / 2 + 10;
          
          // Left boundary
          if (token.position.x < padding) {
            fx += boundaryForce * (padding - token.position.x);
          }
          // Right boundary (adjust for sidebar)
          if (token.position.x > safeWidth - padding) {
            fx -= boundaryForce * (token.position.x - (safeWidth - padding));
          }
          // Top boundary
          if (token.position.y < padding) {
            fy += boundaryForce * (padding - token.position.y);
          }
          // Bottom boundary
          if (token.position.y > dimensions.height - padding) {
            fy -= boundaryForce * (token.position.y - (dimensions.height - padding));
          }
          
          // Update velocity with damping
          const damping = 0.7;
          const velocity = token.velocity || { x: 0, y: 0 };
          const newVelocity = {
            x: (velocity.x + fx) * damping,
            y: (velocity.y + fy) * damping
          };
          
          // Update position
          const updatedToken = {
            ...token,
            position: {
              x: token.position.x + newVelocity.x,
              y: token.position.y + newVelocity.y
            },
            velocity: newVelocity
          };
          
          tokenMap.set(token.id, updatedToken);
        });
        
        // Convert map back to array
        return Array.from(tokenMap.values());
      });
      
      animationRef.current = requestAnimationFrame(applyPhysics);
    };
    
    animationRef.current = requestAnimationFrame(applyPhysics);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [filteredTokens, dimensions, selectedToken]);

  // Handle token selection
  const handleSelectToken = (token: TokenData) => {
    setSelectedToken(token);
    onSelectToken(token);
  };
  
  // Handle token drag start
  const handleDragStart = (token: TokenData) => {
    setTokens(prev => prev.map(t => 
      t.id === token.id ? { ...t, isDragging: true, fixed: true } : t
    ));
  };
  
  // Handle token drag
  const handleDrag = (token: TokenData, position: { x: number, y: number }) => {
    setTokens(prev => prev.map(t => 
      t.id === token.id ? { ...t, position: position } : t
    ));
  };
  
  // Handle token drag end
  const handleDragEnd = (token: TokenData) => {
    setTokens(prev => prev.map(t => 
      t.id === token.id ? { ...t, isDragging: false, fixed: false } : t
    ));
  };

  // Normalize bubble sizes based on the current market cap filter
  const normalizeSize = (marketCap: number): number => {
    // Define the size ranges for each market cap filter
    const sizeRanges = {
      '0-10k': { min: 5, max: 30 },
      '10k-100k': { min: 10, max: 40 },
      '100k-500k': { min: 15, max: 60 },
      '500k-1M': { min: 20, max: 80 },
      '1M+': { min: 30, max: 100 }
    };
    
    // Get the range for the current filter
    const range = sizeRanges[marketCapFilter];
    
    // Find min and max market cap in the filtered tokens
    let minMarketCap = Infinity;
    let maxMarketCap = 0;
    
    filteredTokens.forEach(t => {
      minMarketCap = Math.min(minMarketCap, t.marketCap);
      maxMarketCap = Math.max(maxMarketCap, t.marketCap);
    });
    
    // Normalize the market cap to the size range
    const normalizedSize = minMarketCap === maxMarketCap 
      ? (range.min + range.max) / 2
      : range.min + ((marketCap - minMarketCap) / (maxMarketCap - minMarketCap)) * (range.max - range.min);
    
    return normalizedSize;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-lg border border-white/10 bg-background/50"
    >
      {filteredTokens.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No tokens match the selected filters
        </div>
      ) : (
        filteredTokens.map((token) => (
          <TokenBubble 
            key={token.id} 
            token={token} 
            onClick={handleSelectToken}
            index={filteredTokens.indexOf(token)}
            position={token.position}
            entryDelay={token.entryDelay}
            size={normalizeSize(token.marketCap)}
            onDragStart={() => handleDragStart(token)}
            onDrag={(position) => handleDrag(token, position)}
            onDragEnd={() => handleDragEnd(token)}
            isDragging={token.isDragging}
          />
        ))
      )}
    </div>
  );
};

export default BubbleMap;
