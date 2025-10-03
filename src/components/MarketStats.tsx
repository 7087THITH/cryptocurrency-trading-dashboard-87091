import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { format } from "date-fns";

const initialMarketData = [
  { label: "USD/THB", value: "36.75", change: 0.15, prefix: "", flag: "🇹🇭" },
  { label: "THB/JPY", value: "4.08", change: 0.22, prefix: "", flag: "🇹🇭🇯🇵" },
  { label: "THB/CNY", value: "5.07", change: -0.15, prefix: "", flag: "🇹🇭🇨🇳" },
  { label: "USD/CNY", value: "7.24", change: -0.08, prefix: "", flag: "🇺🇸🇨🇳" },
  { label: "SHFE COPPER (CU)", value: "68,750", change: 0.95, prefix: "¥", flag: "🇨🇳" },
  { label: "SHFE COPPER (CU)", value: "68,820", change: 1.05, prefix: "¥", flag: "🇨🇳" },
  { label: "SHFE ZINC (ZN)", value: "21,450", change: 0.62, prefix: "¥", flag: "🇨🇳" },
  { label: "LME COPPER (CU)", value: "8,245", change: 1.2, prefix: "$", flag: "🇬🇧" },
  { label: "LME COPPER (CU)", value: "8,265", change: 1.35, prefix: "$", flag: "🇬🇧" },
  { label: "LME ZINC (ZN)", value: "2,645", change: 0.8, prefix: "$", flag: "🇬🇧" },
];

const MarketStats = () => {
  const [marketData, setMarketData] = useState(initialMarketData);
  const [lastUpdate, setLastUpdate] = useState(new Date());

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
      setLastUpdate(new Date());
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
            <CarouselItem key={`${item.label}-${index}`} className="pl-4 md:basis-1/3 lg:basis-1/6">
              <div className="glass-card p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{item.flag}</span>
                  <TrendingUpIcon className={`w-4 h-4 ${item.change >= 0 ? 'text-success' : 'text-warning'}`} />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{item.label}</h3>
                <p className="text-2xl font-semibold">
                  {item.prefix}{item.value}
                </p>
                <span className={`text-sm ${item.change >= 0 ? 'text-success' : 'text-warning'} flex items-center gap-1`}>
                  {item.change >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                  {Math.abs(item.change)}%
                </span>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(lastUpdate, "dd/MM/yyyy HH:mm:ss")}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default MarketStats;