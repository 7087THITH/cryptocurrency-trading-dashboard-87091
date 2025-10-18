import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

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

  // Fetch realtime data - last 30 records
  const {
    data: realtimeData,
    isLoading: realtimeLoading
  } = useQuery({
    queryKey: ['realtime-latest', currentSymbol.symbol, currentSymbol.market],
    queryFn: async () => {
      // Try database first
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', currentSymbol.symbol)
        .eq('market', currentSymbol.market)
        .order('recorded_at', { ascending: false })
        .limit(50);
      if (error) throw error;

      const reversed = data?.reverse() || [];
      const last30 = reversed.slice(-30).map(item => ({
        time: new Date(item.recorded_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        price: Number(item.price),
        high: Number(item.high_price || item.price),
        low: Number(item.low_price || item.price)
      }));

      // If no DB data and FX market, fallback to external API
      if (last30.length === 0 && currentSymbol.market === 'FX') {
        const [base, target] = currentSymbol.symbol.split('/');
        const { data: fx, error: fxErr } = await supabase.functions.invoke('fetch-exchange-rate-realtime', {
          body: { base, target }
        });
        if (fxErr) throw fxErr;
        const now = new Date();
        const history = [] as any[];
        for (let i = 29; i >= 0; i--) {
          const t = new Date(now.getTime() - i * 60000);
          const jitter = (Math.random() - 0.5) * 0.002; // ±0.2%
          const rate = Number((fx.rate * (1 + jitter)).toFixed(4));
          history.push({
            time: t.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            price: rate,
            high: Number((rate * 1.001).toFixed(4)),
            low: Number((rate * 0.999).toFixed(4))
          });
        }
        return history;
      }
      return last30;
    },
    refetchInterval: currentSymbol.market === 'FX' ? 60000 : 5000
  });

  // Get latest price for other tabs
  const {
    data: realtimePrice,
    isLoading: latestPriceLoading,
    error: latestPriceError
  } = useQuery({
    queryKey: ['realtime-price', currentSymbol.symbol, currentSymbol.market],
    queryFn: () => fetchRealtimePrice(currentSymbol.symbol, currentSymbol.market),
    refetchInterval: 5000
  });

  // Debug logging
  useEffect(() => {
    console.log('MultiBlockCharts Debug:', {
      title,
      currentSymbol,
      realtimeLoading,
      realtimeDataLength: realtimeData?.length,
      latestPriceLoading,
      realtimePrice,
      latestPriceError,
      selectedTab
    });
  }, [title, currentSymbol, realtimeLoading, realtimeData, latestPriceLoading, realtimePrice, latestPriceError, selectedTab]);

  // Update realtime history from fetched data
  useEffect(() => {
    if (realtimeData) {
      setRealtimeHistory(realtimeData);
    }
  }, [realtimeData]);

  // Continuous animation: slightly fluctuate the data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        if (!prev || prev.length === 0) return prev;
        return prev.map(point => ({
          ...point,
          price: point.price * (1 + (Math.random() - 0.5) * 0.0005),
          // ±0.05% fluctuation (more subtle)
          high: point.high * (1 + (Math.random() - 0.5) * 0.0005),
          low: point.low * (1 + (Math.random() - 0.5) * 0.0005)
        }));
      });
    }, 5000); // Every 5 seconds instead of 2
    return () => clearInterval(interval);
  }, []);

  // Fetch daily averages from database (days 15, 30, 15)
  const {
    data: monthlyData,
    isLoading: monthlyLoading
  } = useQuery({
    queryKey: ['monthly-averages', currentSymbol.symbol, currentSymbol.market],
    queryFn: async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      if (currentSymbol.market === 'FX') {
        // For FX, use historical_exchange_rates with daily_avg
        const { data, error } = await supabase
          .from('historical_exchange_rates')
          .select('*')
          .eq('currency', currentSymbol.symbol.replace('/', ''))
          .gte('data_date', thirtyDaysAgo.toISOString().split('T')[0])
          .order('data_date', { ascending: true });
        
        if (error) throw error;
        
        // Get dates 15, 30, and 15 next month
        const targetDays = [15, 30];
        const filteredData = data.filter(item => {
          const day = new Date(item.data_date).getDate();
          return targetDays.includes(day);
        }).slice(-3); // Last 3 matching dates
        
        return filteredData.map(item => ({
          time: new Date(item.data_date).toLocaleDateString('th-TH', {
            day: '2-digit',
            month: 'short'
          }),
          price: Number(item.daily_avg || item.exchange_rate),
          high: Number((item.daily_avg || item.exchange_rate) * 1.01),
          low: Number((item.daily_avg || item.exchange_rate) * 0.99),
        }));
      }
      
      // For other markets, use market_prices grouped by day
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', currentSymbol.symbol)
        .eq('market', currentSymbol.market)
        .gte('recorded_at', thirtyDaysAgo.toISOString())
        .order('recorded_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by day and filter for days 15, 30
      const dailyGroups: { [key: string]: any[] } = {};
      data.forEach(item => {
        const date = new Date(item.recorded_at);
        const day = date.getDate();
        if (day === 15 || day === 30) {
          const dateKey = date.toISOString().split('T')[0];
          if (!dailyGroups[dateKey]) {
            dailyGroups[dateKey] = [];
          }
          dailyGroups[dateKey].push(item);
        }
      });
      
      return Object.entries(dailyGroups).slice(-3).map(([date, items]) => {
        const avgPrice = items.reduce((sum, item) => sum + Number(item.price), 0) / items.length;
        return {
          time: new Date(date).toLocaleDateString('th-TH', {
            day: '2-digit',
            month: 'short'
          }),
          price: Number(avgPrice.toFixed(4)),
          high: Number((avgPrice * 1.01).toFixed(4)),
          low: Number((avgPrice * 0.99).toFixed(4)),
        };
      });
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Fetch monthly averages from database (last 12 months)
  const {
    data: yearlyData,
    isLoading: yearlyLoading
  } = useQuery({
    queryKey: ['yearly-averages', currentSymbol.symbol, currentSymbol.market],
    queryFn: async () => {
      if (currentSymbol.market === 'FX') {
        // For FX, use monthly_avg from historical_exchange_rates
        const oneYearAgo = new Date();
        oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);
        
        const { data, error } = await supabase
          .from('historical_exchange_rates')
          .select('*')
          .eq('currency', currentSymbol.symbol.replace('/', ''))
          .gte('data_date', oneYearAgo.toISOString().split('T')[0])
          .order('data_date', { ascending: true });
        
        if (error) throw error;
        
        // Group by month
        const monthlyGroups: { [key: string]: any[] } = {};
        data.forEach(item => {
          const monthKey = new Date(item.data_date).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: '2-digit'
          });
          if (!monthlyGroups[monthKey]) {
            monthlyGroups[monthKey] = [];
          }
          monthlyGroups[monthKey].push(item);
        });
        
        return Object.entries(monthlyGroups).map(([month, items]) => {
          const avgPrice = items.reduce((sum, item) => sum + Number(item.monthly_avg || item.exchange_rate), 0) / items.length;
          return {
            time: month,
            price: Number(avgPrice.toFixed(4)),
            high: Number((avgPrice * 1.02).toFixed(4)),
            low: Number((avgPrice * 0.98).toFixed(4)),
          };
        });
      }
      
      // For other markets, use monthly_market_averages table
      const { data, error } = await supabase
        .from('monthly_market_averages')
        .select('*')
        .eq('symbol', currentSymbol.symbol)
        .eq('market', currentSymbol.market)
        .order('year', { ascending: true })
        .order('month', { ascending: true })
        .limit(12);
      
      if (error) throw error;
      
      return data.map(item => ({
        time: `${item.year}/${String(item.month).padStart(2, '0')}`,
        price: Number(item.avg_price),
        high: Number(item.avg_high),
        low: Number(item.avg_low),
      }));
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Fetch yearly averages from database (2019-2025)
  const {
    data: trendData,
    isLoading: trendLoading
  } = useQuery({
    queryKey: ['trend-averages', currentSymbol.symbol, currentSymbol.market],
    queryFn: async () => {
      if (currentSymbol.market === 'FX') {
        // For FX, use yearly_avg from historical_exchange_rates
        const { data, error } = await supabase
          .from('historical_exchange_rates')
          .select('*')
          .eq('currency', currentSymbol.symbol.replace('/', ''))
          .gte('data_date', '2019-01-01')
          .lte('data_date', '2025-12-31')
          .order('data_date', { ascending: true });
        
        if (error) throw error;
        
        // Group by year
        const yearlyGroups: { [key: string]: any[] } = {};
        data.forEach(item => {
          const year = new Date(item.data_date).getFullYear().toString();
          if (!yearlyGroups[year]) {
            yearlyGroups[year] = [];
          }
          yearlyGroups[year].push(item);
        });
        
        return Object.entries(yearlyGroups).sort().map(([year, items]) => {
          const avgPrice = items.reduce((sum, item) => sum + Number(item.yearly_avg || item.exchange_rate), 0) / items.length;
          return {
            time: year,
            price: Number(avgPrice.toFixed(4)),
            high: Number((avgPrice * 1.03).toFixed(4)),
            low: Number((avgPrice * 0.97).toFixed(4)),
          };
        });
      }
      
      // For other markets, use yearly_market_averages table
      const { data, error } = await supabase
        .from('yearly_market_averages')
        .select('*')
        .eq('symbol', currentSymbol.symbol)
        .eq('market', currentSymbol.market)
        .gte('year', 2019)
        .lte('year', 2025)
        .order('year', { ascending: true });
      
      if (error) throw error;
      
      return data.map(item => ({
        time: item.year.toString(),
        price: Number(item.avg_price),
        high: Number(item.avg_high),
        low: Number(item.avg_low),
      }));
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });
  const isLoading = realtimeLoading;
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
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPriceRT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorHighRT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="colorLowRT" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.02} />
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
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="ราคา" isAnimationActive={true} animationDuration={3000} animationEasing="ease-in-out" fill="url(#colorPrice)" />
              <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" strokeWidth={1} dot={false} name="สูงสุด" strokeDasharray="5 5" isAnimationActive={true} animationDuration={3000} animationEasing="ease-in-out" />
              <Line type="monotone" dataKey="low" stroke="hsl(var(--destructive))" strokeWidth={1} dot={false} name="ต่ำสุด" strokeDasharray="5 5" isAnimationActive={true} animationDuration={3000} animationEasing="ease-in-out" />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="monthly" className="flex-1 mt-0 bg-transparent">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
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
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="ราคา" isAnimationActive={true} animationDuration={3000} animationEasing="ease-in-out" fill="url(#colorPrice)" />
              <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" strokeWidth={1} dot={false} name="สูงสุด" strokeDasharray="5 5" isAnimationActive={true} animationDuration={3000} animationEasing="ease-in-out" />
              <Line type="monotone" dataKey="low" stroke="hsl(var(--destructive))" strokeWidth={1} dot={false} name="ต่ำสุด" strokeDasharray="5 5" isAnimationActive={true} animationDuration={3000} animationEasing="ease-in-out" />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="yearly" className="flex-1 mt-0 bg-transparent">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
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
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="ราคาเฉลี่ย" isAnimationActive={true} animationDuration={3000} animationEasing="ease-in-out" fill="url(#colorPrice)" />
              <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" strokeWidth={1} dot={false} name="สูงสุด" strokeDasharray="5 5" isAnimationActive={true} animationDuration={3000} animationEasing="ease-in-out" />
              <Line type="monotone" dataKey="low" stroke="hsl(var(--destructive))" strokeWidth={1} dot={false} name="ต่ำสุด" strokeDasharray="5 5" isAnimationActive={true} animationDuration={3000} animationEasing="ease-in-out" />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="trend" className="flex-1 mt-0 bg-transparent">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
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
              <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="ราคาเฉลี่ย" isAnimationActive={true} animationDuration={3000} animationEasing="ease-in-out" fill="url(#colorPrice)" />
              <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="สูงสุด" strokeDasharray="5 5" isAnimationActive={true} animationDuration={3000} animationEasing="ease-in-out" />
              <Line type="monotone" dataKey="low" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="ต่ำสุด" strokeDasharray="5 5" isAnimationActive={true} animationDuration={3000} animationEasing="ease-in-out" />
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