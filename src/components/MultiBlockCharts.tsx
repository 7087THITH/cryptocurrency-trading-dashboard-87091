import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { memoize } from "@/lib/performance";

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
  const [selectedTab, setSelectedTab] = useState(() => {
    const saved = localStorage.getItem(`multiBlockChart-tab-${title}`);
    return saved || "realtime";
  });
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    localStorage.setItem(`multiBlockChart-tab-${title}`, value);
  };

  // Auto-rotate tabs every 45 seconds
  useEffect(() => {
    const tabs = ["realtime", "monthly", "yearly", "trend"];
    const interval = setInterval(() => {
      setSelectedTab(current => {
        const currentIndex = tabs.indexOf(current);
        const nextIndex = (currentIndex + 1) % tabs.length;
        const nextTab = tabs[nextIndex];
        localStorage.setItem(`multiBlockChart-tab-${title}`, nextTab);
        return nextTab;
      });
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, [title]);

  // Auto-rotate symbols every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedSymbol(current => {
        const nextIndex = (current + 1) % symbols.length;
        return nextIndex;
      });
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [symbols.length]);

  // Fetch 12 hours of historical data for realtime chart
  const {
    data: realtimeData,
    isLoading: realtimeLoading
  } = useQuery({
    queryKey: ['realtime-12h', currentSymbol.symbol, currentSymbol.market],
    queryFn: async () => {
      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
      
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', currentSymbol.symbol)
        .eq('market', currentSymbol.market)
        .gte('recorded_at', twelveHoursAgo.toISOString())
        .order('recorded_at', { ascending: true });
      
      if (error) throw error;
      
      return data?.map(item => ({
        time: new Date(item.recorded_at).toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        price: item.price,
        high: item.high_price,
        low: item.low_price
      })) || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000
  });

  // Get latest price for other tabs
  const {
    data: realtimePrice
  } = useQuery({
    queryKey: ['realtime-price', currentSymbol.symbol, currentSymbol.market],
    queryFn: () => fetchRealtimePrice(currentSymbol.symbol, currentSymbol.market),
    refetchInterval: 30000,
    staleTime: 15000
  });

  // Update realtime history from fetched data
  useEffect(() => {
    if (realtimeData) {
      setRealtimeHistory(realtimeData);
    }
  }, [realtimeData]);

  // Fetch monthly data (last 30 days) from database
  const {
    data: monthlyData,
    isLoading: monthlyLoading
  } = useQuery({
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
      
      // Group by day
      const dailyGroups: { [key: string]: any[] } = {};
      data?.forEach(item => {
        const dayKey = new Date(item.recorded_at).toLocaleDateString('th-TH', {
          day: '2-digit',
          month: 'short'
        });
        if (!dailyGroups[dayKey]) {
          dailyGroups[dayKey] = [];
        }
        dailyGroups[dayKey].push(item);
      });

      return Object.keys(dailyGroups).map(dayKey => {
        const items = dailyGroups[dayKey];
        const avgPrice = items.reduce((sum, item) => sum + Number(item.price), 0) / items.length;
        const maxHigh = Math.max(...items.map(item => Number(item.high_price || item.price)));
        const minLow = Math.min(...items.map(item => Number(item.low_price || item.price)));
        
        return {
          time: dayKey,
          price: Number(avgPrice.toFixed(4)),
          high: Number(maxHigh.toFixed(4)),
          low: Number(minLow.toFixed(4)),
        };
      });
    },
    refetchInterval: 120000,
    staleTime: 60000
  });

  // Fetch yearly data (last 12 months) from database
  const {
    data: yearlyData,
    isLoading: yearlyLoading
  } = useQuery({
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
      
      // Group by month
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
    refetchInterval: 300000,
    staleTime: 120000
  });

  // Fetch trend data (2019-2025) from database
  const {
    data: trendData,
    isLoading: trendLoading
  } = useQuery({
    queryKey: ['trend-chart', currentSymbol.symbol, currentSymbol.market],
    queryFn: async () => {
      const startDate = new Date('2019-01-01');
      
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', currentSymbol.symbol)
        .eq('market', currentSymbol.market)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      
      // Group by year
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
    refetchInterval: 600000,
    staleTime: 300000
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
    return <div className="glass-card p-6 rounded-lg h-full animate-fade-in flex flex-col">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          กำลังโหลด...
        </div>
      </div>;
  }
  if (!chartData || chartData.length === 0) {
    return <div className="glass-card p-6 rounded-lg h-full animate-fade-in flex flex-col">
        <h2 className="mb-4 text-base text-right font-semibold">{title}</h2>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          ไม่มีข้อมูล
        </div>
      </div>;
  }
  const latestData = chartData[chartData.length - 1];
  return <div className="glass-card p-6 rounded-lg h-full animate-fade-in flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="text-right">
          <div className="text-xl font-bold text-primary rounded-3xl">{latestData?.price?.toFixed(4)}</div>
          <div className="text-xs text-muted-foreground">{latestData?.time}</div>
        </div>
      </div>
      
      {/* Symbol selector */}
      <div className="flex gap-3 mb-4 text-xs">
        {symbols.map((sym, idx) => <button key={idx} onClick={() => setSelectedSymbol(idx)} className={`transition-colors font-medium ${selectedSymbol === idx ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            {sym.label}
          </button>)}
      </div>

      <Tabs value={selectedTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mb-4 bg-blue-500/20">
          <TabsTrigger value="realtime" className="text-xs text-blue-500">Realtime</TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs">รายวัน (15, 30, 15)</TabsTrigger>
          <TabsTrigger value="yearly" className="text-xs">รายเดือน (1 ปี)</TabsTrigger>
          <TabsTrigger value="trend" className="text-xs text-gray-50 bg-slate-950 hover:bg-slate-800">Trend (2019-2025)</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="flex-1 mt-0 bg-transparent">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} style={{
            background: 'transparent'
          }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={9} interval="preserveStartEnd" />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} domain={['auto', 'auto']} width={45} />
              <Tooltip contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '11px'
            }} />
              <Legend wrapperStyle={{
              fontSize: '10px'
            }} />
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="ราคา" isAnimationActive={false} fill="url(#colorPrice)" />
              <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" strokeWidth={1} dot={false} name="สูงสุด" strokeDasharray="5 5" isAnimationActive={false} />
              <Line type="monotone" dataKey="low" stroke="hsl(var(--destructive))" strokeWidth={1} dot={false} name="ต่ำสุด" strokeDasharray="5 5" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="monthly" className="flex-1 mt-0 bg-transparent">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} style={{
            background: 'transparent'
          }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={9} interval={0} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} domain={['auto', 'auto']} width={45} />
              <Tooltip contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '11px'
            }} />
              <Legend wrapperStyle={{
              fontSize: '10px'
            }} />
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={true} name="ราคา" isAnimationActive={false} fill="url(#colorPrice)" />
              <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" strokeWidth={1} dot={false} name="สูงสุด" strokeDasharray="5 5" isAnimationActive={false} />
              <Line type="monotone" dataKey="low" stroke="hsl(var(--destructive))" strokeWidth={1} dot={false} name="ต่ำสุด" strokeDasharray="5 5" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="yearly" className="flex-1 mt-0 bg-transparent">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} style={{
            background: 'transparent'
          }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={9} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} domain={['auto', 'auto']} width={45} />
              <Tooltip contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '11px'
            }} />
              <Legend wrapperStyle={{
              fontSize: '10px'
            }} />
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={true} name="ราคาเฉลี่ย" isAnimationActive={false} fill="url(#colorPrice)" />
              <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" strokeWidth={1} dot={true} name="สูงสุด" strokeDasharray="5 5" isAnimationActive={false} />
              <Line type="monotone" dataKey="low" stroke="hsl(var(--destructive))" strokeWidth={1} dot={true} name="ต่ำสุด" strokeDasharray="5 5" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="trend" className="flex-1 mt-0 bg-transparent">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} style={{
            background: 'transparent'
          }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} domain={['auto', 'auto']} width={45} />
              <Tooltip contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '11px'
            }} />
              <Legend wrapperStyle={{
              fontSize: '10px'
            }} />
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={true} name="ราคาเฉลี่ย" isAnimationActive={false} fill="url(#colorPrice)" />
              <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" strokeWidth={2} dot={true} name="สูงสุด" strokeDasharray="5 5" isAnimationActive={false} />
              <Line type="monotone" dataKey="low" stroke="hsl(var(--destructive))" strokeWidth={2} dot={true} name="ต่ำสุด" strokeDasharray="5 5" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>;
};
const MultiBlockCharts = () => {
  const block1Symbols = [{
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
  }];
  const block2Symbols = [{
    label: "SHFE COPPER (CU)",
    market: "SHFE",
    symbol: "CU"
  }, {
    label: "LME COPPER (CU)",
    market: "LME",
    symbol: "CU"
  }];
  const block3Symbols = [{
    label: "SHFE ALUMINIUM (AL)",
    market: "SHFE",
    symbol: "AL"
  }, {
    label: "LME ALUMINIUM (AL)",
    market: "LME",
    symbol: "AL"
  }];
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in mb-8">
      <div className="h-[500px]">
        <ChartBlock title="THB currency pair" symbols={block1Symbols} />
      </div>
      <div className="h-[500px]">
        <ChartBlock title="Copper currency pair" symbols={block2Symbols} />
      </div>
      <div className="h-[500px]">
        <ChartBlock title="Aluminium currency pair" symbols={block3Symbols} />
      </div>
    </div>;
};
export default MultiBlockCharts;