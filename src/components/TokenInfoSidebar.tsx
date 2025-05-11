
import React from 'react';
import { X, ExternalLink, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TokenData } from '@/lib/types';
import { formatMarketCap, formatPrice, formatVolume, generateSparklineData } from '@/lib/mock-data';

interface TokenChartProps {
  data: number[];
}

const TokenChart: React.FC<TokenChartProps> = ({ data }) => {
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal;

  // Generate the points for the SVG polyline
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((val - minVal) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="w-full h-40 mt-4">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
        {/* Chart gradient fill */}
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(155, 135, 245)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(155, 135, 245)" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Fill area */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill="url(#chartGradient)"
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#9b87f5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

interface TokenInfoSidebarProps {
  token?: TokenData;
  onClose: () => void;
}

const TokenInfoSidebar: React.FC<TokenInfoSidebarProps> = ({ token, onClose }) => {
  const chartData = React.useMemo(() => generateSparklineData(), [token]);

  if (!token) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 h-full w-80 glass-morphism z-50 overflow-y-auto transition-transform duration-300 transform translate-x-0">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gradient-purple">
            {token.name} <span className="text-white/60 text-sm">({token.ticker})</span>
          </h2>
          <Button size="icon" variant="ghost" onClick={onClose} className="text-white/60 hover:text-white">
            <X size={20} />
          </Button>
        </div>

        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
            <img src={token.logo} alt={token.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-xs text-white/60 mb-1">Market Cap</div>
            <div className="text-lg font-bold">{formatMarketCap(token.marketCap)}</div>
          </div>
        </div>

        <TokenChart data={chartData} />

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="text-xs text-white/60 mb-1">Price</div>
            <div className="font-mono font-medium">{formatPrice(token.price)}</div>
          </div>
          <div className="bg-white/5 p-3 rounded-lg">
            <div className="text-xs text-white/60 mb-1">Volume (24h)</div>
            <div className="font-mono font-medium">{formatVolume(token.volume24h)}</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3 text-white/80">Links</h3>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="flex justify-between" asChild>
              <a href={token.pumpLink} target="_blank" rel="noopener noreferrer">
                <span>Pump.fun</span>
                <ExternalLink size={16} />
              </a>
            </Button>
            
            {token.twitter && (
              <Button variant="outline" className="flex justify-between" asChild>
                <a href={token.twitter} target="_blank" rel="noopener noreferrer">
                  <span className="flex items-center">
                    <Twitter size={16} className="mr-2" />
                    Twitter
                  </span>
                  <ExternalLink size={16} />
                </a>
              </Button>
            )}
            
            {token.telegram && (
              <Button variant="outline" className="flex justify-between" asChild>
                <a href={token.telegram} target="_blank" rel="noopener noreferrer">
                  <span className="flex items-center">
                    <MessageCircle size={16} className="mr-2" />
                    Telegram
                  </span>
                  <ExternalLink size={16} />
                </a>
              </Button>
            )}
            
            {token.website && (
              <Button variant="outline" className="flex justify-between" asChild>
                <a href={token.website} target="_blank" rel="noopener noreferrer">
                  <span>Website</span>
                  <ExternalLink size={16} />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 text-xs text-white/40 text-center">
          Token launched {new Date(token.launchTimestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default TokenInfoSidebar;
