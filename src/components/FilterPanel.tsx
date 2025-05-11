
import React from 'react';
import { Button } from '@/components/ui/button';
import { TimeframeFilter, MarketCapFilter } from '@/lib/types';

interface FilterPanelProps {
  timeframeFilter: TimeframeFilter;
  setTimeframeFilter: (filter: TimeframeFilter) => void;
  marketCapFilter: MarketCapFilter;
  setMarketCapFilter: (filter: MarketCapFilter) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  timeframeFilter,
  setTimeframeFilter,
  marketCapFilter,
  setMarketCapFilter
}) => {
  const timeframes: TimeframeFilter[] = ['1h', '2h', '3h', '6h', '12h', '24h', '3d', '7d'];
  const marketCaps: MarketCapFilter[] = ['0-10k', '10k-100k', '100k-500k', '500k-1M', '1M+'];

  return (
    <div className="glass-morphism p-4 rounded-lg mb-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2 text-white/80">Timeframe</h3>
        <div className="flex flex-wrap gap-2">
          {timeframes.map(tf => (
            <Button
              key={tf}
              variant={timeframeFilter === tf ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframeFilter(tf)}
              className={timeframeFilter === tf ? "bg-bubble-purple text-white" : "bg-white/5 text-white/60"}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold mb-2 text-white/80">Market Cap</h3>
        <div className="flex flex-wrap gap-2">
          {marketCaps.map(mc => (
            <Button
              key={mc}
              variant={marketCapFilter === mc ? "default" : "outline"}
              size="sm"
              onClick={() => setMarketCapFilter(mc)}
              className={marketCapFilter === mc ? "bg-bubble-purple text-white" : "bg-white/5 text-white/60"}
            >
              {mc}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
