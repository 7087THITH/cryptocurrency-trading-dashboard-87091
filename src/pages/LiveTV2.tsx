import RealtimeChart from '@/components/charts/RealtimeChart';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useState, useEffect } from 'react';

const LiveTV2 = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const charts = [
    { symbol: 'USD/THB', market: 'FX', title: 'USD/THB' },
    { symbol: 'THB/JPY', market: 'FX', title: 'THB/JPY' },
    { symbol: 'THB/CNY', market: 'FX', title: 'THB/CNY' },
    { symbol: 'USD/CNY', market: 'FX', title: 'USD/CNY' },
    { symbol: 'CU', market: 'SHFE', title: 'SHFE COPPER (CU)' },
    { symbol: 'AL', market: 'SHFE', title: 'SHFE ALUMINIUM (AL)' },
  ];

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <h1 className="text-2xl font-bold">Live TV 2 - Real-time Charts</h1>
        <p className="text-sm text-muted-foreground">กราฟแสดงข้อมูลแบบเรียลไทม์ (เปลี่ยนอัตโนมัติทุก 5 วินาที)</p>
      </div>

      <div className="flex-1 relative">
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full h-full"
        >
          <CarouselContent className="h-[calc(100vh-120px)]">
            {charts.map((chart, index) => (
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
          {charts.map((_, index) => (
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
