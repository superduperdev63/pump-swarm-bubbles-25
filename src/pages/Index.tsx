
import React, { useState } from 'react';
import BubbleMap from '../components/BubbleMap';
import FilterPanel from '../components/FilterPanel';
import TokenInfoSidebar from '../components/TokenInfoSidebar';
import { TokenData } from '@/lib/types';
import { TimeframeFilter, MarketCapFilter } from '@/lib/types';

const Index = () => {
  const [selectedToken, setSelectedToken] = useState<TokenData | undefined>(undefined);
  const [timeframeFilter, setTimeframeFilter] = useState<TimeframeFilter>('1h');
  const [marketCapFilter, setMarketCapFilter] = useState<MarketCapFilter>('0-10k');

  const handleSelectToken = (token: TokenData) => {
    setSelectedToken(token);
  };

  const handleCloseSidebar = () => {
    setSelectedToken(undefined);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      <header className="glass-morphism py-4 px-6 z-10">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gradient">SolanaBubbles</h1>
            <div className="text-xs sm:text-sm text-white/60">
              Memecoin Market Visualization
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className="container mx-auto py-4 px-6">
          <FilterPanel 
            timeframeFilter={timeframeFilter}
            setTimeframeFilter={setTimeframeFilter}
            marketCapFilter={marketCapFilter}
            setMarketCapFilter={setMarketCapFilter}
          />
          
          <div className="h-[calc(100vh-200px)] w-full relative">
            <BubbleMap 
              onSelectToken={handleSelectToken}
              timeframeFilter={timeframeFilter}
              marketCapFilter={marketCapFilter}
            />
          </div>
        </div>

        {selectedToken && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={handleCloseSidebar}
            ></div>
            <TokenInfoSidebar 
              token={selectedToken} 
              onClose={handleCloseSidebar} 
            />
          </>
        )}
      </main>

      <footer className="glass-morphism py-3 px-6">
        <div className="container mx-auto text-center text-xs text-white/40">
          Bubble visualization for Solana memecoins on Pump.fun (using mock data)
        </div>
      </footer>
    </div>
  );
};

export default Index;
