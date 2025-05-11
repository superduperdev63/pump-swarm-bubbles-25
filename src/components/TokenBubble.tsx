
import React, { useState, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';
import { TokenData, calculateBubbleSize, formatMarketCap, getTokenGradient } from '@/lib/mock-data';

interface TokenBubbleProps {
  token: TokenData;
  onClick: (token: TokenData) => void;
  index: number;
}

const TokenBubble = memo(({ token, onClick, index }: TokenBubbleProps) => {
  const [size, setSize] = useState(calculateBubbleSize(token.marketCap));
  const [isAnimating, setIsAnimating] = useState(false);
  const gradient = getTokenGradient(token);
  
  // Animation delay based on index for staggered entry
  const animationDelay = `${Math.min(index * 0.1, 2)}s`;
  
  // Simulate market cap changes
  useEffect(() => {
    const interval = setInterval(() => {
      // 30% chance of a market cap change
      if (Math.random() > 0.7) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    }, 5000 + Math.random() * 5000); // Random interval between 5-10 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Random position calculation
  const top = `${20 + Math.random() * 60}%`;
  const left = `${20 + Math.random() * 60}%`;
  
  return (
    <div 
      className={cn(
        "absolute rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 animate-bubble-in",
        isAnimating ? 'animate-bubble-grow' : '',
        `bubble-gradient-${gradient}`
      )}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        top,
        left,
        animationDelay,
        zIndex: Math.floor(token.marketCap / 10000),
      }}
      onClick={() => onClick(token)}
    >
      <div className="tooltip opacity-0 absolute bottom-full mb-2 bg-black/80 text-white text-xs p-2 rounded pointer-events-none transition-opacity group-hover:opacity-100 whitespace-nowrap">
        {token.name} ({token.ticker})
        <br />
        {formatMarketCap(token.marketCap)}
      </div>
      
      {size > 30 && (
        <span className="text-white font-bold text-xs md:text-sm overflow-hidden text-ellipsis max-w-[80%] text-center">
          {token.ticker}
        </span>
      )}
    </div>
  );
});

TokenBubble.displayName = 'TokenBubble';

export default TokenBubble;
