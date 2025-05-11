
import React, { useState, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';
import { TokenData } from '@/lib/types';
import { calculateBubbleSize, formatMarketCap, getTokenGradient } from '@/lib/mock-data';

interface TokenBubbleProps {
  token: TokenData;
  onClick: (token: TokenData) => void;
  index: number;
  position: { x: number, y: number };
  entryDelay: number;
}

const TokenBubble = memo(({ token, onClick, index, position, entryDelay }: TokenBubbleProps) => {
  const [size, setSize] = useState(calculateBubbleSize(token.marketCap));
  const [isAnimating, setIsAnimating] = useState(false);
  const [entered, setEntered] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), entryDelay);
    return () => clearTimeout(timer);
  }, [entryDelay]);
  
  // Simulate market cap changes
  useEffect(() => {
    // Less frequent market cap changes (20% chance every 6-12 seconds)
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    }, 6000 + Math.random() * 6000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Very subtle continuous "breathing" animation to make the map feel alive
  const breathingStyle = {
    animation: 'pulseVerySubtle 4s ease-in-out infinite',
  };
  
  // Determine if this is a tiny bubble (these are the majority)
  const isTinyBubble = token.marketCap < 5000;
  const isSmallBubble = token.marketCap < 20000;
  
  // Hover content display logic - only show ticker on small bubbles, name on hover
  const showTickerInBubble = size > 20 && !isTinyBubble;
  
  // Tooltip display logic
  const showTooltipOnHover = isHovered && (isTinyBubble || isSmallBubble);
  
  return (
    <>
      <div 
        className={cn(
          "absolute rounded-full flex items-center justify-center cursor-pointer z-10",
          isAnimating ? 'animate-bubble-grow' : '',
          "transition-all duration-500 hover:z-50",
          isTinyBubble ? 'hover:scale-[3]' : 'hover:scale-110'
        )}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          left: `${position.x}px`,
          top: `${position.y}px`,
          background: `var(--bubble-${getTokenGradient(token)})`,
          transform: entered ? 'translateX(0) scale(1)' : 'translateX(-100px) scale(0.5)',
          opacity: entered ? (isTinyBubble ? 0.7 : 1) : 0,
          transition: `all 0.5s ease-out ${entryDelay}ms`,
          zIndex: Math.floor(token.marketCap / 10000),
          ...breathingStyle
        }}
        onClick={() => onClick(token)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showTickerInBubble && (
          <span className="text-white font-bold text-[0.6rem] md:text-xs overflow-hidden text-ellipsis max-w-[80%] text-center">
            {token.ticker}
          </span>
        )}
        
        {/* Tooltip that appears on hover for tiny/small bubbles */}
        {showTooltipOnHover && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-black/80 text-white text-[0.6rem] px-1.5 py-1 rounded pointer-events-none z-50">
            {token.ticker} <span className="text-white/60">${formatMarketCap(token.marketCap).replace('$', '')}</span>
          </div>
        )}
      </div>
      
      {/* Tooltip that appears for larger bubbles */}
      {isHovered && !isTinyBubble && !isSmallBubble && (
        <div className="fixed z-50 pointer-events-none bg-black/80 text-white text-xs p-2 rounded-md shadow-lg"
             style={{
               left: `${position.x + size/2 + 10}px`,
               top: `${position.y - 10}px`,
             }}>
          <div className="font-semibold">{token.name} ({token.ticker})</div>
          <div className="text-[0.6rem] text-white/70">{formatMarketCap(token.marketCap)}</div>
        </div>
      )}
    </>
  );
});

TokenBubble.displayName = 'TokenBubble';

export default TokenBubble;
