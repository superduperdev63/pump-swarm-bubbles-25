
import React, { useState, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';
import { TokenData } from '@/lib/types';
import { calculateBubbleSize, formatMarketCap, getTokenGradient } from '@/lib/mock-data';

interface TokenBubbleProps {
  token: TokenData;
  onClick: (token: TokenData) => void;
  index: number;
}

const TokenBubble = memo(({ token, onClick, index }: TokenBubbleProps) => {
  const [size, setSize] = useState(calculateBubbleSize(token.marketCap));
  const [isAnimating, setIsAnimating] = useState(false);
  const [entered, setEntered] = useState(false);
  
  // Animation delay based on index for staggered entry
  const animationDelay = `${Math.min(index * 0.1, 2)}s`;
  
  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);
  
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

  // Position calculation - more evenly distributed
  const left = `${20 + (index % 5) * 18}%`;
  const top = `${20 + Math.floor(index / 5) * 20}%`;
  
  return (
    <div 
      className={cn(
        "absolute rounded-full flex items-center justify-center cursor-pointer transition-all duration-500",
        isAnimating ? 'animate-bubble-grow' : '',
        "hover:scale-110 hover:z-50"
      )}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        top,
        left,
        background: `var(--bubble-${getTokenGradient(token)})`,
        transform: entered ? 'translateX(0) scale(1)' : 'translateX(-100px) scale(0.5)',
        opacity: entered ? 1 : 0,
        transition: `all 0.5s ease-out ${animationDelay}`,
        zIndex: Math.floor(token.marketCap / 10000),
      }}
      onClick={() => onClick(token)}
    >
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm bg-black/30 transition-opacity">
        <div className="text-white text-xs p-2 pointer-events-none whitespace-nowrap">
          {token.name}
        </div>
      </div>
      
      {size > 30 && (
        <span className="text-white font-bold text-xs md:text-sm overflow-hidden text-ellipsis max-w-[80%] text-center">
          {token.ticker}
        </span>
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-black/80 text-white text-xs p-2 rounded whitespace-nowrap">
        {token.name} ({token.ticker})
        <br />
        {formatMarketCap(token.marketCap)}
      </div>
    </div>
  );
});

TokenBubble.displayName = 'TokenBubble';

export default TokenBubble;
