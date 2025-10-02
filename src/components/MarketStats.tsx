import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const initialMarketData = [
  { label: "USD/CNY", value: "7.24", change: -0.08, prefix: "" },
  { label: "LME Copper", value: "8,245", change: 1.2, prefix: "$" },
  { label: "SHFE Aluminum", value: "18,950", change: -0.3, prefix: "¥" },
  { label: "USD/THB", value: "36.75", change: 0.15, prefix: "฿" },
  { label: "EUR/USD", value: "1.0842", change: -0.22, prefix: "" },
  { label: "LME Zinc", value: "2,645", change: 0.8, prefix: "$" },
];

const MarketStats = () => {
  const [marketData, setMarketData] = useState(initialMarketData);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setMarketData((current) =>
        current.map((item) => ({
          ...item,
          value: item.value.replace(/,/g, '').includes('.') 
            ? (parseFloat(item.value.replace(/,/g, '')) + (Math.random() - 0.5) * 0.1).toFixed(item.value.split('.')[1]?.length || 2)
            : Math.round(parseFloat(item.value.replace(/,/g, '')) + (Math.random() - 0.5) * 50).toLocaleString(),
          change: parseFloat((item.change + (Math.random() - 0.5) * 0.3).toFixed(2)),
        }))
      );
    }, 2000);

    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  return (
    <div className="mb-8 animate-fade-in">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {marketData.map((item, index) => (
            <CarouselItem key={`${item.label}-${index}`} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="glass-card p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">{item.label}</h3>
                  <TrendingUpIcon className={`w-4 h-4 ${item.change >= 0 ? 'text-success' : 'text-warning'}`} />
                </div>
                <p className="text-2xl font-semibold mt-2">
                  {item.prefix}{item.value}
                </p>
                <span className={`text-sm ${item.change >= 0 ? 'text-success' : 'text-warning'} flex items-center gap-1`}>
                  {item.change >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                  {Math.abs(item.change)}%
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default MarketStats;