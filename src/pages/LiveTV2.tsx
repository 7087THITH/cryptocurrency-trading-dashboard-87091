import TradingViewWidget from 'react-tradingview-widget';
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
    { symbol: 'FX_IDC:USDTHB', title: 'USD/THB' },
    { symbol: 'FX_IDC:THBJPY', title: 'THB/JPY' },
    { symbol: 'FX_IDC:THBCNY', title: 'THB/CNY' },
    { symbol: 'FX_IDC:USDCNY', title: 'USD/CNY' },
    { symbol: 'SHFE:CU1!', title: 'SHFE COPPER (CU)' },
    { symbol: 'SHFE:AL1!', title: 'SHFE ALUMINIUM (AL)' },
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
              <CarouselItem key={`${chart.symbol}-${index}`} className="h-full">
                <div className="h-full p-6">
                  <div className="glass-card p-6 rounded-lg h-full animate-fade-in flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-semibold">{chart.title}</h2>
                    </div>
                    <div className="flex-1 w-full">
                      <TradingViewWidget
                        symbol={chart.symbol}
                        theme="light"
                        locale="en"
                        autosize
                        hide_side_toolbar={true}
                        allow_symbol_change={false}
                        interval="D"
                        toolbar_bg="#FAFAF8"
                        enable_publishing={false}
                        hide_top_toolbar={false}
                        save_image={false}
                        container_id={`tradingview_chart_${index}`}
                        studies={[]}
                        disabled_features={[
                          "header_indicators",
                          "header_compare",
                          "header_screenshot",
                          "header_undo_redo"
                        ]}
                        enabled_features={[
                          "hide_left_toolbar_by_default"
                        ]}
                      />
                    </div>
                  </div>
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
