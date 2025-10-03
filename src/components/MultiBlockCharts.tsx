import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Fetch real-time price from Twelve Data API
const fetchRealtimePrice = async (symbol: string, market: string) => {
  const { data, error } = await supabase.functions.invoke('get-realtime-price', {
    body: { symbol, market }
  });
  
  if (error) throw error;
  return data;
};

interface ChartBlockProps {
  title: string;
  symbols: { label: string; market: string; symbol: string }[];
}

const ChartBlock = ({ title, symbols }: ChartBlockProps) => {
  const [selectedSymbol, setSelectedSymbol] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [realtimeHistory, setRealtimeHistory] = useState<any[]>([]);
  const currentSymbol = symbols[selectedSymbol];

  const [selectedTab, setSelectedTab] = useState(() => {
    const saved = localStorage.getItem(`multiBlockChart-tab-${title}`);
    return saved || "monthly";
  });

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    localStorage.setItem(`multiBlockChart-tab-${title}`, value);
  };

  // Fetch real-time price and generate mock historical data
  const { data: realtimePrice, isLoading: realtimeLoading } = useQuery({
    queryKey: ['realtime-price', currentSymbol.symbol, currentSymbol.market],
    queryFn: () => fetchRealtimePrice(currentSymbol.symbol, currentSymbol.market),
    refetchInterval: 60000, // Refresh every 60 seconds to avoid rate limit
  });

  // Update realtime history when new data arrives
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
          low: realtimePrice.low_price,
        }];
        // Keep only last 30 data points
        return newHistory.slice(-30);
      });
    }
  }, [realtimePrice]);

  // Generate mock monthly data based on real-time price
  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-chart', currentSymbol.symbol, currentSymbol.market, realtimePrice?.price],
    queryFn: async () => {
      if (!realtimePrice) return [];
      
      const basePrice = realtimePrice.price;
      const data = [];
      const now = new Date();
      
      // Generate 30 days of mock data with variation
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const variation = (Math.random() - 0.5) * basePrice * 0.03; // ±3% variation
        const dayPrice = basePrice + variation;
        
        data.push({
          time: date.toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit'
          }),
          price: Number(dayPrice.toFixed(4)),
          high: Number((dayPrice * 1.01).toFixed(4)),
          low: Number((dayPrice * 0.99).toFixed(4)),
        });
      }
      
      return data;
    },
    enabled: !!realtimePrice,
    refetchInterval: 60000,
  });

  // Generate mock yearly data based on real-time price
  const { data: yearlyData, isLoading: yearlyLoading } = useQuery({
    queryKey: ['yearly-chart', currentSymbol.symbol, currentSymbol.market, realtimePrice?.price],
    queryFn: async () => {
      if (!realtimePrice) return [];
      
      const basePrice = realtimePrice.price;
      const data = [];
      const now = new Date();
      
      // Generate 12 months of mock data
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        
        const variation = (Math.random() - 0.5) * basePrice * 0.05; // ±5% variation
        const monthPrice = basePrice + variation;
        
        data.push({
          time: date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: '2-digit'
          }),
          price: Number(monthPrice.toFixed(4)),
          high: Number((monthPrice * 1.02).toFixed(4)),
          low: Number((monthPrice * 0.98).toFixed(4)),
        });
      }
      
      return data;
    },
    enabled: !!realtimePrice,
    refetchInterval: 60000,
  });

  // Generate mock trend data based on real-time price
  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ['trend-chart', currentSymbol.symbol, currentSymbol.market, realtimePrice?.price],
    queryFn: async () => {
      if (!realtimePrice) return [];
      
      const basePrice = realtimePrice.price;
      const data = [];
      const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025'];
      
      // Generate yearly trend data
      years.forEach((year, index) => {
        const trend = (index - 3) * 0.02; // Create a trend pattern
        const variation = (Math.random() - 0.5) * 0.1;
        const yearPrice = basePrice * (1 + trend + variation);
        
        data.push({
          time: year,
          price: Number(yearPrice.toFixed(4)),
          high: Number((yearPrice * 1.03).toFixed(4)),
          low: Number((yearPrice * 0.97).toFixed(4)),
        });
      });
      
      return data;
    },
    enabled: !!realtimePrice,
    refetchInterval: 60000,
  });

  const isLoading = realtimeLoading || monthlyLoading || yearlyLoading || trendLoading;

  useEffect(() => {
    if (selectedTab === 'realtime' && realtimeHistory) {
      setChartData(realtimeHistory);
    } else if (selectedTab === 'monthly' && monthlyData) {
      setChartData(monthlyData);
    } else if (selectedTab === 'yearly' && yearlyData) {
      setChartData(yearlyData);
    } else if (selectedTab === 'trend' && trendData) {
      setChartData(trendData);
    }
  }, [selectedTab, monthlyData, yearlyData, trendData, realtimeHistory]);

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg h-full animate-fade-in flex flex-col">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          กำลังโหลด...
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="glass-card p-6 rounded-lg h-full animate-fade-in flex flex-col">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          ไม่มีข้อมูล
        </div>
      </div>
    );
  }

  const latestData = chartData[chartData.length - 1];

  return (
    <div className="glass-card p-6 rounded-lg h-full animate-fade-in flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="text-right">
          <div className="text-xl font-bold text-primary">{latestData?.price?.toFixed(4)}</div>
          <div className="text-xs text-muted-foreground">{latestData?.time}</div>
        </div>
      </div>
      
      {/* Symbol selector */}
      <div className="flex gap-3 mb-4 text-xs">
        {symbols.map((sym, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedSymbol(idx)}
            className={`transition-colors font-medium ${
              selectedSymbol === idx
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {sym.label}
          </button>
        ))}
      </div>

      <Tabs value={selectedTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="realtime" className="text-xs">Realtime</TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs">รายวัน (30 วัน)</TabsTrigger>
          <TabsTrigger value="yearly" className="text-xs">รายเดือน (1 ปี)</TabsTrigger>
          <TabsTrigger value="trend" className="text-xs">Trend (2019-2025)</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="flex-1 mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={9}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={9}
                domain={['auto', 'auto']}
                width={45}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={true}
                name="ราคา"
                isAnimationActive={true}
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="hsl(var(--success))" 
                strokeWidth={1}
                dot={true}
                name="สูงสุด"
                strokeDasharray="5 5"
                isAnimationActive={true}
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={1}
                dot={true}
                name="ต่ำสุด"
                strokeDasharray="5 5"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="monthly" className="flex-1 mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={9}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={9}
                domain={['auto', 'auto']}
                width={45}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                name="ราคา"
                isAnimationActive={true}
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="hsl(var(--success))" 
                strokeWidth={1}
                dot={false}
                name="สูงสุด"
                strokeDasharray="5 5"
                isAnimationActive={true}
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={1}
                dot={false}
                name="ต่ำสุด"
                strokeDasharray="5 5"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="yearly" className="flex-1 mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={9}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={9}
                domain={['auto', 'auto']}
                width={45}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={true}
                name="ราคาเฉลี่ย"
                isAnimationActive={true}
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="hsl(var(--success))" 
                strokeWidth={1}
                dot={true}
                name="สูงสุด"
                strokeDasharray="5 5"
                isAnimationActive={true}
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={1}
                dot={true}
                name="ต่ำสุด"
                strokeDasharray="5 5"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="trend" className="flex-1 mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={9}
                domain={['auto', 'auto']}
                width={45}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={true}
                name="ราคาเฉลี่ย"
                isAnimationActive={true}
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={true}
                name="สูงสุด"
                strokeDasharray="5 5"
                isAnimationActive={true}
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={true}
                name="ต่ำสุด"
                strokeDasharray="5 5"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MultiBlockCharts = () => {
  const block1Symbols = [
    { label: "USD/THB", market: "FX", symbol: "USDTHB" },
    { label: "THB/JPY", market: "FX", symbol: "THBJPY" },
    { label: "THB/CNY", market: "FX", symbol: "THBCNY" },
  ];

  const block2Symbols = [
    { label: "USD/CNY", market: "FX", symbol: "USDCNY" },
    { label: "SHFE COPPER (CU)", market: "SHFE", symbol: "CU" },
    { label: "LME COPPER (CU)", market: "LME", symbol: "CU" },
  ];

  const block3Symbols = [
    { label: "USD/CNY", market: "FX", symbol: "USDCNY" },
    { label: "SHFE ALUMINIUM (AL)", market: "SHFE", symbol: "AL" },
    { label: "LME ALUMINIUM (AL)", market: "LME", symbol: "AL" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
      <div className="mb-6 animate-pulse-slow">
        <ChartBlock title="บล็อคที่ 1: คู่สกุลเงิน THB" symbols={block1Symbols} />
      </div>
      <ChartBlock title="บล็อคที่ 2: USD/CNY และ Copper" symbols={block2Symbols} />
      <ChartBlock title="บล็อคที่ 3: USD/CNY และ Aluminium" symbols={block3Symbols} />
    </div>
  );
};

export default MultiBlockCharts;
