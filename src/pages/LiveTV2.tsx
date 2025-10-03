import RealtimeChart from '@/components/charts/RealtimeChart';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const LiveTV2 = () => {
  const charts = [
    { symbol: 'USD/THB', market: 'FX', title: 'USD/THB' },
    { symbol: 'THB/JPY', market: 'FX', title: 'THB/JPY' },
    { symbol: 'THB/CNY', market: 'FX', title: 'THB/CNY' },
    { symbol: 'USD/CNY', market: 'FX', title: 'USD/CNY' },
    { symbol: 'CU', market: 'SHFE', title: 'SHFE COPPER (CU)' },
    { symbol: 'AL', market: 'SHFE', title: 'SHFE ALUMINIUM (AL)' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Live TV 2 - Real-time Charts</h1>
        <p className="text-muted-foreground mt-2">กราฟแสดงข้อมูลแบบเรียลไทม์ (เปลี่ยนอัตโนมัติทุก 5 วินาที)</p>
      </div>

      <Carousel
        opts={{
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {charts.map((chart, index) => (
            <CarouselItem key={`${chart.symbol}-${chart.market}-${index}`}>
              <div className="h-[calc(100vh-200px)]">
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
    </div>
  );
};

export default LiveTV2;
