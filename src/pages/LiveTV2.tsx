import RealtimeChart from '@/components/charts/RealtimeChart';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useState, useEffect, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const LiveTV2 = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  
  // Load delay from localStorage or use default
  const [delay, setDelay] = useState(() => {
    const savedDelay = localStorage.getItem('liveTV2-delay');
    return savedDelay ? parseInt(savedDelay) : 5000;
  });
  
  const autoplayRef = useRef(
    Autoplay({
      delay: delay,
    })
  );

  // All possible charts
  const allCharts = [
    { symbol: 'USD/THB', market: 'FX', title: 'USD/THB' },
    { symbol: 'THB/JPY', market: 'FX', title: 'THB/JPY' },
    { symbol: 'THB/CNY', market: 'FX', title: 'THB/CNY' },
    { symbol: 'USD/CNY', market: 'FX', title: 'USD/CNY' },
    { symbol: 'CU', market: 'SHFE', title: 'SHFE COPPER (CU)' },
    { symbol: 'AL', market: 'SHFE', title: 'SHFE ALUMINIUM (AL)' },
  ];

  // Check which charts have data
  const { data: availableCharts = allCharts } = useQuery({
    queryKey: ['available-charts'],
    queryFn: async () => {
      const chartsWithData = await Promise.all(
        allCharts.map(async (chart) => {
          const { data, error } = await supabase
            .from('market_prices')
            .select('id')
            .eq('symbol', chart.symbol)
            .eq('market', chart.market)
            .limit(1);
          
          return { ...chart, hasData: !error && data && data.length > 0 };
        })
      );
      
      return chartsWithData.filter(chart => chart.hasData);
    },
    refetchInterval: 60000, // Check every minute
  });

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (autoplayRef.current) {
      autoplayRef.current.stop();
      autoplayRef.current = Autoplay({
        delay: delay,
      });
      if (api) {
        api.reInit();
      }
    }
  }, [delay, api]);

  const handleDelayChange = (value: number[]) => {
    const newDelay = value[0] * 1000;
    setDelay(newDelay);
    localStorage.setItem('liveTV2-delay', newDelay.toString());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Live TV 2 - Real-time Charts</h1>
          <p className="text-sm text-muted-foreground">กราฟแสดงข้อมูลแบบเรียลไทม์</p>
        </div>
        
        <div className="flex items-center gap-4 max-w-md">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">เวลาในการเลื่อน</label>
              <span className="text-sm text-muted-foreground">{delay / 1000} วินาที</span>
            </div>
            <Slider
              value={[delay / 1000]}
              onValueChange={handleDelayChange}
              min={3}
              max={30}
              step={1}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
          }}
          plugins={[autoplayRef.current]}
          className="w-full h-full"
        >
          <CarouselContent className="h-[calc(100vh-140px)]">
            {availableCharts.map((chart, index) => (
              <CarouselItem key={`${chart.symbol}-${chart.market}-${index}`} className="h-full">
                <div className="h-full p-4">
                  <RealtimeChart
                    symbol={chart.symbol}
                    market={chart.market}
                    title={chart.title}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/80 backdrop-blur p-2 rounded-full">
          {availableCharts.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === current
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/50 hover:bg-muted-foreground'
              }`}
              aria-label={`Go to chart ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveTV2;
