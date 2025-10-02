import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import MonthlyChart from '@/components/charts/MonthlyChart';
import YearlyChart from '@/components/charts/YearlyChart';
import TrendChart from '@/components/charts/TrendChart';

type ChartType = 'monthly' | 'yearly' | 'trend';

interface ChartData {
  name: string;
  symbol: string;
  market: string;
  chartType: ChartType;
  chartLabel: string;
}

const CHART_SLIDES: ChartData[] = [
  // USD/THB
  { name: 'USD/THB', symbol: 'USD/THB', market: 'FX', chartType: 'monthly', chartLabel: 'Monthly (1-30 วัน)' },
  { name: 'USD/THB', symbol: 'USD/THB', market: 'FX', chartType: 'yearly', chartLabel: 'Yearly (1-12 เดือน)' },
  { name: 'USD/THB', symbol: 'USD/THB', market: 'FX', chartType: 'trend', chartLabel: 'Trend (2019-2023)' },
  
  // THB/JPY
  { name: 'THB/JPY', symbol: 'THB/JPY', market: 'FX', chartType: 'monthly', chartLabel: 'Monthly (1-30 วัน)' },
  { name: 'THB/JPY', symbol: 'THB/JPY', market: 'FX', chartType: 'yearly', chartLabel: 'Yearly (1-12 เดือน)' },
  { name: 'THB/JPY', symbol: 'THB/JPY', market: 'FX', chartType: 'trend', chartLabel: 'Trend (2019-2023)' },
  
  // THB/CNY
  { name: 'THB/CNY', symbol: 'THB/CNY', market: 'FX', chartType: 'monthly', chartLabel: 'Monthly (1-30 วัน)' },
  { name: 'THB/CNY', symbol: 'THB/CNY', market: 'FX', chartType: 'yearly', chartLabel: 'Yearly (1-12 เดือน)' },
  { name: 'THB/CNY', symbol: 'THB/CNY', market: 'FX', chartType: 'trend', chartLabel: 'Trend (2019-2023)' },
  
  // USD/CNY
  { name: 'USD/CNY', symbol: 'USD/CNY', market: 'FX', chartType: 'monthly', chartLabel: 'Monthly (1-30 วัน)' },
  { name: 'USD/CNY', symbol: 'USD/CNY', market: 'FX', chartType: 'yearly', chartLabel: 'Yearly (1-12 เดือน)' },
  { name: 'USD/CNY', symbol: 'USD/CNY', market: 'FX', chartType: 'trend', chartLabel: 'Trend (2019-2023)' },
  
  // LME COPPER
  { name: 'LME COPPER', symbol: 'COPPER', market: 'METALS', chartType: 'monthly', chartLabel: 'Monthly (1-30 วัน)' },
  { name: 'LME COPPER', symbol: 'COPPER', market: 'METALS', chartType: 'yearly', chartLabel: 'Yearly (1-12 เดือน)' },
  { name: 'LME COPPER', symbol: 'COPPER', market: 'METALS', chartType: 'trend', chartLabel: 'Trend (2019-2023)' },
  
  // LME ALUMINIUM
  { name: 'LME ALUMINIUM', symbol: 'ALUMINIUM', market: 'METALS', chartType: 'monthly', chartLabel: 'Monthly (1-30 วัน)' },
  { name: 'LME ALUMINIUM', symbol: 'ALUMINIUM', market: 'METALS', chartType: 'yearly', chartLabel: 'Yearly (1-12 เดือน)' },
  { name: 'LME ALUMINIUM', symbol: 'ALUMINIUM', market: 'METALS', chartType: 'trend', chartLabel: 'Trend (2019-2023)' },
  
  // SHFE COPPER
  { name: 'SHFE COPPER', symbol: 'COPPER', market: 'SHFE', chartType: 'monthly', chartLabel: 'Monthly (1-30 วัน)' },
  { name: 'SHFE COPPER', symbol: 'COPPER', market: 'SHFE', chartType: 'yearly', chartLabel: 'Yearly (1-12 เดือน)' },
  { name: 'SHFE COPPER', symbol: 'COPPER', market: 'SHFE', chartType: 'trend', chartLabel: 'Trend (2019-2023)' },
  
  // SHFE ALUMINIUM
  { name: 'SHFE ALUMINIUM', symbol: 'ALUMINIUM', market: 'SHFE', chartType: 'monthly', chartLabel: 'Monthly (1-30 วัน)' },
  { name: 'SHFE ALUMINIUM', symbol: 'ALUMINIUM', market: 'SHFE', chartType: 'yearly', chartLabel: 'Yearly (1-12 เดือน)' },
  { name: 'SHFE ALUMINIUM', symbol: 'ALUMINIUM', market: 'SHFE', chartType: 'trend', chartLabel: 'Trend (2019-2023)' },
];

const LiveTV = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalDuration, setIntervalDuration] = useState(15000); // 15 seconds

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CHART_SLIDES.length);
    }, intervalDuration);

    return () => clearInterval(timer);
  }, [isPlaying, intervalDuration, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CHART_SLIDES.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + CHART_SLIDES.length) % CHART_SLIDES.length);
  };

  const currentSlide = CHART_SLIDES[currentIndex];

  const renderChart = () => {
    const { symbol, market, chartType } = currentSlide;
    
    switch (chartType) {
      case 'monthly':
        return <MonthlyChart symbol={symbol} market={market} />;
      case 'yearly':
        return <YearlyChart symbol={symbol} market={market} />;
      case 'trend':
        return <TrendChart symbol={symbol} market={market} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header with controls */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Live TV</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-sm">{currentIndex + 1} / {CHART_SLIDES.length}</span>
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
            <div className="p-6 border-b border-border">
              <h2 className="text-3xl font-bold">{currentSlide.name}</h2>
              <p className="text-lg text-muted-foreground mt-2">
                {currentSlide.chartLabel}
              </p>
            </div>
            
            <div className="flex-1 p-6">
              <div className="h-full w-full">
                {renderChart()}
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
