import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ChartBlockProps {
  title: string;
  symbols: { label: string; market: string; symbol: string }[];
}

const ChartBlock = ({ title, symbols }: ChartBlockProps) => {
  const [selectedSymbol, setSelectedSymbol] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const currentSymbol = symbols[selectedSymbol];

  const [selectedTab, setSelectedTab] = useState(() => {
    const saved = localStorage.getItem(`multiBlockChart-tab-${title}`);
    return saved || "monthly";
  });

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    localStorage.setItem(`multiBlockChart-tab-${title}`, value);
  };

  // Fetch monthly data (last 30 days)
  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-chart', currentSymbol.symbol, currentSymbol.market],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', currentSymbol.symbol)
        .eq('market', currentSymbol.market)
        .gte('recorded_at', thirtyDaysAgo.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      
      return data?.map(item => ({
        time: new Date(item.recorded_at).toLocaleDateString('th-TH', {
          day: '2-digit',
          month: '2-digit'
        }),
        price: Number(item.price),
        high: Number(item.high_price || item.price),
        low: Number(item.low_price || item.price),
      })) || [];
    },
    refetchInterval: 60000,
  });

  // Fetch yearly data (last 12 months)
  const { data: yearlyData, isLoading: yearlyLoading } = useQuery({
    queryKey: ['yearly-chart', currentSymbol.symbol, currentSymbol.market],
    queryFn: async () => {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', currentSymbol.symbol)
        .eq('market', currentSymbol.market)
        .gte('recorded_at', twelveMonthsAgo.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      
      const monthlyGroups: { [key: string]: any[] } = {};
      data?.forEach(item => {
        const monthKey = new Date(item.recorded_at).toLocaleDateString('th-TH', {
          year: 'numeric',
          month: '2-digit'
        });
        if (!monthlyGroups[monthKey]) {
          monthlyGroups[monthKey] = [];
        }
        monthlyGroups[monthKey].push(item);
      });

      return Object.keys(monthlyGroups).map(monthKey => {
        const items = monthlyGroups[monthKey];
        const avgPrice = items.reduce((sum, item) => sum + Number(item.price), 0) / items.length;
        const maxHigh = Math.max(...items.map(item => Number(item.high_price || item.price)));
        const minLow = Math.min(...items.map(item => Number(item.low_price || item.price)));
        
        return {
          time: monthKey,
          price: Number(avgPrice.toFixed(4)),
          high: Number(maxHigh.toFixed(4)),
          low: Number(minLow.toFixed(4)),
        };
      });
    },
    refetchInterval: 60000,
  });

  // Fetch trend data (2019-2025)
  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ['trend-chart', currentSymbol.symbol, currentSymbol.market],
    queryFn: async () => {
      const startDate = new Date('2019-01-01');
      const endDate = new Date('2025-12-31');
      
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', currentSymbol.symbol)
        .eq('market', currentSymbol.market)
        .gte('recorded_at', startDate.toISOString())
        .lte('recorded_at', endDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      
      const yearlyGroups: { [key: string]: any[] } = {};
      data?.forEach(item => {
        const year = new Date(item.recorded_at).getFullYear().toString();
        if (!yearlyGroups[year]) {
          yearlyGroups[year] = [];
        }
        yearlyGroups[year].push(item);
      });

      return Object.keys(yearlyGroups).sort().map(year => {
        const items = yearlyGroups[year];
        const avgPrice = items.reduce((sum, item) => sum + Number(item.price), 0) / items.length;
        const maxHigh = Math.max(...items.map(item => Number(item.high_price || item.price)));
        const minLow = Math.min(...items.map(item => Number(item.low_price || item.price)));
        
        return {
          time: year,
          price: Number(avgPrice.toFixed(4)),
          high: Number(maxHigh.toFixed(4)),
          low: Number(minLow.toFixed(4)),
        };
      });
    },
    refetchInterval: 60000,
  });

  const isLoading = monthlyLoading || yearlyLoading || trendLoading;

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
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="monthly" className="text-xs">รายวัน (30 วัน)</TabsTrigger>
          <TabsTrigger value="yearly" className="text-xs">รายเดือน (1 ปี)</TabsTrigger>
          <TabsTrigger value="trend" className="text-xs">Trend (2019-2025)</TabsTrigger>
        </TabsList>

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
      <ChartBlock title="บล็อคที่ 1: คู่สกุลเงิน THB" symbols={block1Symbols} />
      <ChartBlock title="บล็อคที่ 2: USD/CNY และ Copper" symbols={block2Symbols} />
      <ChartBlock title="บล็อคที่ 3: USD/CNY และ Aluminium" symbols={block3Symbols} />
    </div>
  );
};

export default MultiBlockCharts;
