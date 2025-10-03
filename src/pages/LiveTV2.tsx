import { Carousel, CarouselContent, CarouselItem, CarouselApi, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useState, useEffect, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Clock, Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetch latest price from market_prices table
const fetchRealtimePrice = async (symbol: string, market: string) => {
  const {
    data,
    error
  } = await supabase.from('market_prices').select('*').eq('symbol', symbol).eq('market', market).order('recorded_at', {
    ascending: false
  }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
};
interface ChartBlockProps {
  title: string;
  symbols: {
    label: string;
    market: string;
    symbol: string;
  }[];
}
const ChartBlock = ({
  title,
  symbols
}: ChartBlockProps) => {
  const [selectedSymbol, setSelectedSymbol] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [realtimeHistory, setRealtimeHistory] = useState<any[]>([]);
  const currentSymbol = symbols[selectedSymbol];
  const [selectedTab, setSelectedTab] = useState("monthly");

  // Auto-rotate tabs every 45 seconds
  useEffect(() => {
    const tabs = ["monthly", "yearly", "trend"];
    const interval = setInterval(() => {
      setSelectedTab(current => {
        const currentIndex = tabs.indexOf(current);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex];
      });
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate symbols every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedSymbol(current => (current + 1) % symbols.length);
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [symbols.length]);

  // Fetch real-time price every 15 seconds
  const {
    data: realtimePrice,
    isLoading: realtimeLoading
  } = useQuery({
    queryKey: ['realtime-price', currentSymbol.symbol, currentSymbol.market],
    queryFn: () => fetchRealtimePrice(currentSymbol.symbol, currentSymbol.market),
    refetchInterval: 15000
  });

  // Update realtime history
  useEffect(() => {
    if (realtimePrice) {
      const now = new Date();
      const timeString = now.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setRealtimeHistory(prev => {
        const newHistory = [...prev, {
          time: timeString,
          price: realtimePrice.price,
          high: realtimePrice.high_price,
          low: realtimePrice.low_price
        }];
        return newHistory.slice(-240);
      });
    }
  }, [realtimePrice]);

  // Generate monthly data
  const {
    data: monthlyData,
    isLoading: monthlyLoading
  } = useQuery({
    queryKey: ['monthly-chart', currentSymbol.symbol, currentSymbol.market, realtimePrice?.price],
    queryFn: async () => {
      if (!realtimePrice) return [];
      const basePrice = realtimePrice.price;
      const data = [];
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const date15PrevMonth = new Date(currentYear, currentMonth - 1, 15);
      const date30Current = now.getDate() >= 30 ? new Date(currentYear, currentMonth, 30) : new Date(currentYear, currentMonth - 1, 30);
      const date15NextMonth = new Date(currentYear, currentMonth + 1, 15);
      const targetDates = [{
        date: date15PrevMonth,
        label: "15 เดือนก่อน"
      }, {
        date: date30Current,
        label: "30 ปัจจุบัน"
      }, {
        date: date15NextMonth,
        label: "15 เดือนหน้า"
      }];
      targetDates.forEach(({
        date
      }) => {
        const variation = (Math.random() - 0.5) * basePrice * 0.03;
        const dayPrice = basePrice + variation;
        data.push({
          time: date.toLocaleDateString('th-TH', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
          }),
          price: Number(dayPrice.toFixed(4)),
          high: Number((dayPrice * 1.01).toFixed(4)),
          low: Number((dayPrice * 0.99).toFixed(4))
        });
      });
      return data;
    },
    enabled: !!realtimePrice,
    refetchInterval: 60000
  });

  // Generate yearly data
  const {
    data: yearlyData,
    isLoading: yearlyLoading
  } = useQuery({
    queryKey: ['yearly-chart', currentSymbol.symbol, currentSymbol.market, realtimePrice?.price],
    queryFn: async () => {
      if (!realtimePrice) return [];
      const basePrice = realtimePrice.price;
      const data = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const variation = (Math.random() - 0.5) * basePrice * 0.05;
        const monthPrice = basePrice + variation;
        data.push({
          time: date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: '2-digit'
          }),
          price: Number(monthPrice.toFixed(4)),
          high: Number((monthPrice * 1.02).toFixed(4)),
          low: Number((monthPrice * 0.98).toFixed(4))
        });
      }
      return data;
    },
    enabled: !!realtimePrice,
    refetchInterval: 60000
  });

  // Generate trend data
  const {
    data: trendData,
    isLoading: trendLoading
  } = useQuery({
    queryKey: ['trend-chart', currentSymbol.symbol, currentSymbol.market, realtimePrice?.price],
    queryFn: async () => {
      if (!realtimePrice) return [];
      const basePrice = realtimePrice.price;
      const data = [];
      const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
      years.forEach((year, index) => {
        const trend = (index - 3) * 0.02;
        const variation = (Math.random() - 0.5) * 0.1;
        const yearPrice = basePrice * (1 + trend + variation);
        data.push({
          time: year,
          price: Number(yearPrice.toFixed(4)),
          high: Number((yearPrice * 1.03).toFixed(4)),
          low: Number((yearPrice * 0.97).toFixed(4))
        });
      });
      return data;
    },
    enabled: !!realtimePrice,
    refetchInterval: 60000
  });
  const isLoading = realtimeLoading || monthlyLoading || yearlyLoading || trendLoading;
  useEffect(() => {
    if (selectedTab === 'monthly' && monthlyData) {
      setChartData(monthlyData);
    } else if (selectedTab === 'yearly' && yearlyData) {
      setChartData(yearlyData);
    } else if (selectedTab === 'trend' && trendData) {
      setChartData(trendData);
    }
  }, [selectedTab, monthlyData, yearlyData, trendData]);
  if (isLoading) {
    return <div className="glass-card p-6 rounded-lg h-full animate-fade-in flex flex-col">
        <h2 className="text-3xl font-semibold mb-4">{title}</h2>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-xl">
          กำลังโหลด...
        </div>
      </div>;
  }
  if (!chartData || chartData.length === 0) {
    return <div className="glass-card p-6 rounded-lg h-full animate-fade-in flex flex-col">
        <h2 className="mb-4 text-3xl font-semibold">{title}</h2>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-xl">
          ไม่มีข้อมูล
        </div>
      </div>;
  }
  const latestData = chartData[chartData.length - 1];
  return <div className="glass-card p-8 rounded-lg h-full animate-fade-in flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">{title}</h2>
        <div className="text-right">
          <div className="text-4xl font-bold text-primary">{latestData?.price?.toFixed(4)}</div>
          <div className="text-lg text-muted-foreground">{latestData?.time}</div>
        </div>
      </div>

      <TabsList className="grid w-full grid-cols-3 mb-6 bg-blue-100 dark:bg-blue-950 h-14">
        <TabsTrigger value="monthly" className="text-base font-semibold">รายวัน (15, 30, 15)</TabsTrigger>
        <TabsTrigger value="yearly" className="text-base font-semibold">รายเดือน (1 ปี)</TabsTrigger>
        <TabsTrigger value="trend" className="text-base font-semibold">Trend (2019-2025)</TabsTrigger>
      </TabsList>
      
      {/* Symbol selector */}
      <div className="flex gap-6 mb-6 text-lg">
        {symbols.map((sym, idx) => <button key={idx} onClick={() => setSelectedSymbol(idx)} className={`transition-colors font-semibold ${selectedSymbol === idx ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {sym.label}
          </button>)}
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 flex flex-col">
        <TabsContent value="monthly" className="flex-1 mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={14} interval={0} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={14} domain={['auto', 'auto']} width={80} />
              <Tooltip contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '14px'
            }} />
              <Legend wrapperStyle={{
              fontSize: '14px'
            }} />
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={3} dot={true} name="ราคา" isAnimationActive={true} />
              <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="สูงสุด" strokeDasharray="5 5" isAnimationActive={true} />
              <Line type="monotone" dataKey="low" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="ต่ำสุด" strokeDasharray="5 5" isAnimationActive={true} />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="yearly" className="flex-1 mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={14} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={14} domain={['auto', 'auto']} width={80} />
              <Tooltip contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '14px'
            }} />
              <Legend wrapperStyle={{
              fontSize: '14px'
            }} />
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={3} dot={true} name="ราคาเฉลี่ย" isAnimationActive={true} />
              <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" strokeWidth={2} dot={true} name="สูงสุด" strokeDasharray="5 5" isAnimationActive={true} />
              <Line type="monotone" dataKey="low" stroke="hsl(var(--destructive))" strokeWidth={2} dot={true} name="ต่ำสุด" strokeDasharray="5 5" isAnimationActive={true} />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="trend" className="flex-1 mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={14} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={14} domain={['auto', 'auto']} width={80} />
              <Tooltip contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '14px'
            }} />
              <Legend wrapperStyle={{
              fontSize: '14px'
            }} />
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={3} dot={true} name="ราคาเฉลี่ย" isAnimationActive={true} />
              <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" strokeWidth={3} dot={true} name="สูงสุด" strokeDasharray="5 5" isAnimationActive={true} />
              <Line type="monotone" dataKey="low" stroke="hsl(var(--destructive))" strokeWidth={3} dot={true} name="ต่ำสุด" strokeDasharray="5 5" isAnimationActive={true} />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>;
};
const LiveTV2 = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Load delay from localStorage or use default (45 seconds)
  const [delay, setDelay] = useState(() => {
    const savedDelay = localStorage.getItem('liveTV2-delay');
    return savedDelay ? parseInt(savedDelay) : 45000;
  });
  const autoplayRef = useRef(Autoplay({
    delay: delay
  }));

  // All chart blocks from MultiBlockCharts
  const chartBlocks = [{
    title: "THB currency pair",
    symbols: [{
      label: "USD/THB",
      market: "FX",
      symbol: "USD/THB"
    }, {
      label: "THB/JPY",
      market: "FX",
      symbol: "THB/JPY"
    }, {
      label: "THB/CNY",
      market: "FX",
      symbol: "THB/CNY"
    }, {
      label: "USD/CNY",
      market: "FX",
      symbol: "USD/CNY"
    }]
  }, {
    title: "Copper currency pair",
    symbols: [{
      label: "SHFE COPPER (CU)",
      market: "SHFE",
      symbol: "CU"
    }, {
      label: "LME COPPER (CU)",
      market: "LME",
      symbol: "CU"
    }]
  }, {
    title: "Aluminium currency pair",
    symbols: [{
      label: "SHFE ALUMINIUM (AL)",
      market: "SHFE",
      symbol: "AL"
    }, {
      label: "LME ALUMINIUM (AL)",
      market: "LME",
      symbol: "AL"
    }]
  }];
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
        delay: delay
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
  return <div className="h-screen w-screen bg-background overflow-hidden">
      <div className="h-full relative">
        <Carousel setApi={setApi} opts={{
        loop: true
      }} plugins={[autoplayRef.current]} className="w-full h-full relative">
          <CarouselPrevious className="left-4 h-14 w-14 border-2 z-10">
            <ChevronLeft className="h-8 w-8" />
          </CarouselPrevious>
          <CarouselNext className="right-4 h-14 w-14 border-2 z-10">
            <ChevronRight className="h-8 w-8" />
          </CarouselNext>
          <CarouselContent className="h-full">
            {chartBlocks.map((block, index) => <CarouselItem key={`${block.title}-${index}`} className="h-full">
                <div className="h-full p-6">
                  <ChartBlock title={block.title} symbols={block.symbols} />
                </div>
              </CarouselItem>)}
          </CarouselContent>
        </Carousel>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-background/80 backdrop-blur p-3 rounded-full z-10">
          {chartBlocks.map((_, index) => <button key={index} onClick={() => api?.scrollTo(index)} className={`h-3 rounded-full transition-all ${index === current ? 'w-12 bg-primary' : 'w-3 bg-muted-foreground/50 hover:bg-muted-foreground'}`} aria-label={`Go to chart ${index + 1}`} />)}
        </div>
      </div>
    </div>;
};
export default LiveTV2;