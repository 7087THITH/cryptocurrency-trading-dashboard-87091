import TradingViewWidget from 'react-tradingview-widget';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useState, useEffect, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Clock, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const LiveTV2 = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
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

  // All trading view charts
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

  const togglePlayPause = () => {
    if (isPlaying) {
      autoplayRef.current.stop();
    } else {
      autoplayRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Live TV 2 - Real-time Charts</h1>
          <p className="text-sm text-muted-foreground">กราฟแสดงข้อมูลแบบเรียลไทม์</p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            onClick={togglePlayPause}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="h-5 w-5" />
                หยุด
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                เล่น
              </>
            )}
          </Button>

          <div className="flex items-center gap-4 flex-1 max-w-md">
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
      </div>

      <div className="flex-1 relative">
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
          }}
          plugins={[autoplayRef.current]}
          className="w-full h-full relative"
        >
          <CarouselPrevious className="left-4 h-12 w-12" />
          <CarouselNext className="right-4 h-12 w-12" />
          <CarouselContent className="h-[calc(100vh-140px)]">
            {charts.map((chart, index) => (
              <CarouselItem key={`${chart.symbol}-${index}`} className="h-full">
                <div className="h-full p-4">
                  <div className="glass-card p-6 rounded-lg h-full animate-fade-in flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">{chart.title}</h2>
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
