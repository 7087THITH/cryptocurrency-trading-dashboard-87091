import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import TradingViewWidget from 'react-tradingview-widget';

const TRADING_PAIRS = [
  { name: 'USD/THB', symbol: 'FX:USDTHB', interval: '15' },
  { name: 'THB/JPY', symbol: 'FX:THBJPY', interval: '15' },
  { name: 'THB/CNY', symbol: 'FX:THBCNY', interval: '15' },
  { name: 'USD/CNY', symbol: 'FX:USDCNY', interval: '15' },
  { name: 'LME Copper', symbol: 'COMEX:HG1!', interval: '15' },
  { name: 'LME Aluminum', symbol: 'COMEX:ALI1!', interval: '15' },
  { name: 'LME Zinc', symbol: 'COMEX:ZI1!', interval: '15' },
];

const LiveTV = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalDuration, setIntervalDuration] = useState(15000); // 15 seconds

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TRADING_PAIRS.length);
    }, intervalDuration);

    return () => clearInterval(timer);
  }, [isPlaying, intervalDuration, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TRADING_PAIRS.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + TRADING_PAIRS.length) % TRADING_PAIRS.length);
  };

  const currentPair = TRADING_PAIRS[currentIndex];

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header with controls */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Live TV</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">{currentIndex + 1} / {TRADING_PAIRS.length}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant={isPlaying ? "default" : "outline"}
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="flex gap-2 ml-4">
            <Button
              variant={intervalDuration === 10000 ? "default" : "outline"}
              size="sm"
              onClick={() => setIntervalDuration(10000)}
            >
              10s
            </Button>
            <Button
              variant={intervalDuration === 15000 ? "default" : "outline"}
              size="sm"
              onClick={() => setIntervalDuration(15000)}
            >
              15s
            </Button>
            <Button
              variant={intervalDuration === 30000 ? "default" : "outline"}
              size="sm"
              onClick={() => setIntervalDuration(30000)}
            >
              30s
            </Button>
          </div>
        </div>
      </div>

      {/* Chart Display Area */}
      <div className="flex-1 relative">
        <div className="absolute inset-0 p-4">
          <div className="glass-card h-full flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-3xl font-bold">{currentPair.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                กราฟแท่งเทียนแบบเรียลไทม์ - อัพเดททุก {intervalDuration / 1000} วินาที
              </p>
            </div>
            
            <div className="flex-1 p-4">
              <div className="h-full w-full">
                <TradingViewWidget
                  key={currentPair.symbol}
                  symbol={currentPair.symbol}
                  theme="light"
                  locale="th"
                  autosize
                  hide_side_toolbar={false}
                  allow_symbol_change={false}
                  interval={currentPair.interval}
                  toolbar_bg="#FAFAF8"
                  enable_publishing={false}
                  hide_top_toolbar={false}
                  save_image={false}
                  studies={["MACD@tv-basicstudies", "RSI@tv-basicstudies"]}
                  style="1"
                  container_id={`tradingview_chart_${currentIndex}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {isPlaying && (
        <div className="h-1 bg-secondary">
          <div 
            className="h-full bg-primary transition-all duration-1000"
            style={{
              width: `${((Date.now() % intervalDuration) / intervalDuration) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LiveTV;
