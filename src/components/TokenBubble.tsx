
import React, { useState, useEffect, memo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { TokenData } from '@/lib/types';
import { formatMarketCap, getTokenGradient } from '@/lib/mock-data';

interface TokenBubbleProps {
  token: TokenData;
  onClick: (token: TokenData) => void;
  index: number;
  position?: { x: number, y: number };
  entryDelay?: number;
  size: number;
  onDragStart: () => void;
  onDrag: (position: { x: number, y: number }) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
}

const TokenBubble = memo(({ 
  token, 
  onClick, 
  index, 
  position, 
  entryDelay = 0, 
  size, 
  onDragStart, 
  onDrag, 
  onDragEnd, 
  isDragging 
}: TokenBubbleProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [entered, setEntered] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prevSize, setPrevSize] = useState(size);
  const dragRef = useRef<{ dragging: boolean, offsetX: number, offsetY: number }>({
    dragging: false,
    offsetX: 0,
    offsetY: 0
  });
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), entryDelay);
    return () => clearTimeout(timer);
  }, [entryDelay]);
  
  // Animate when size changes
  useEffect(() => {
    if (prevSize !== size && entered) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      setPrevSize(size);
      return () => clearTimeout(timer);
    }
    setPrevSize(size);
  }, [size, prevSize, entered]);
  
  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!bubbleRef.current) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const rect = bubbleRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - size / 2;
    const offsetY = e.clientY - rect.top - size / 2;
    
    dragRef.current = {
      dragging: true,
      offsetX,
      offsetY
    };
    
    onDragStart();
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.dragging || !bubbleRef.current) return;
    
    const parentRect = bubbleRef.current.parentElement?.getBoundingClientRect();
    if (!parentRect) return;
    
    const x = e.clientX - parentRect.left - dragRef.current.offsetX;
    const y = e.clientY - parentRect.top - dragRef.current.offsetY;
    
    onDrag({ x, y });
  };
  
  const handleMouseUp = () => {
    dragRef.current.dragging = false;
    onDragEnd();
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Handle touch events for mobile dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!bubbleRef.current) return;
    
    e.stopPropagation();
    
    const touch = e.touches[0];
    const rect = bubbleRef.current.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left - size / 2;
    const offsetY = touch.clientY - rect.top - size / 2;
    
    dragRef.current = {
      dragging: true,
      offsetX,
      offsetY
    };
    
    onDragStart();
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (!dragRef.current.dragging || !bubbleRef.current) return;
    
    const parentRect = bubbleRef.current.parentElement?.getBoundingClientRect();
    if (!parentRect) return;
    
    const touch = e.touches[0];
    const x = touch.clientX - parentRect.left - dragRef.current.offsetX;
    const y = touch.clientY - parentRect.top - dragRef.current.offsetY;
    
    onDrag({ x, y });
  };
  
  const handleTouchEnd = () => {
    dragRef.current.dragging = false;
    onDragEnd();
    
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
  
  // Determine if this is a tiny bubble
  const isTinyBubble = size < 15;
  const isSmallBubble = size < 30;
  
  // Hover content display logic - only show ticker on small bubbles, name on hover
  const showTickerInBubble = size > 20 && !isTinyBubble;
  
  // Tooltip display logic
  const showTooltipOnHover = isHovered && (isTinyBubble || isSmallBubble);
  
  // Bubble style with position and size
  const bubbleStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    left: position ? `${position.x - size / 2}px` : '0',
    top: position ? `${position.y - size / 2}px` : '0',
    background: `var(--bubble-${getTokenGradient(token)})`,
    transform: entered 
      ? `scale(${isAnimating ? 1.1 : 1})`
      : 'translateX(-100px) scale(0.5)',
    opacity: entered ? (isTinyBubble ? 0.7 : 1) : 0,
    transition: `all ${isAnimating ? '0.3s' : '0.5s'} ease-out ${entered ? '0s' : `${entryDelay}ms`}`,
    zIndex: isDragging ? 1000 : Math.floor(size),
    cursor: isDragging ? 'grabbing' : 'grab',
    animation: 'pulseVerySubtle 4s ease-in-out infinite',
  };
  
  const handleBubbleClick = (e: React.MouseEvent) => {
    if (!dragRef.current.dragging) {
      onClick(token);
    }
  };
  
  return (
    <>
      <div 
        ref={bubbleRef}
        className={cn(
          "absolute rounded-full flex items-center justify-center",
          isDragging ? 'shadow-lg' : '',
        )}
        style={bubbleStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleBubbleClick}
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
            {token.ticker} <span className="text-white/60">{formatMarketCap(token.marketCap).replace('$', '')}</span>
          </div>
        )}
      </div>
      
      {/* Tooltip that appears for larger bubbles */}
      {isHovered && !isTinyBubble && !isSmallBubble && (
        <div className="fixed z-50 pointer-events-none bg-black/80 text-white text-xs p-2 rounded-md shadow-lg"
             style={{
               left: `${position?.x ? position.x + size/2 + 10 : 0}px`,
               top: `${position?.y ? position.y - 10 : 0}px`,
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
