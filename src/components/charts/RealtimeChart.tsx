import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RealtimeChartProps {
  symbol: string;
  market: string;
  title: string;
}

const RealtimeChart = ({ symbol, market, title }: RealtimeChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Load selected tab from localStorage
  const [selectedTab, setSelectedTab] = useState(() => {
    const saved = localStorage.getItem(`realtimeChart-tab-${symbol}-${market}`);
    return saved || "monthly";
  });

  // Save tab selection to localStorage
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    localStorage.setItem(`realtimeChart-tab-${symbol}-${market}`, value);
  };

  // Monthly data (last 30 days)
  const { data: monthlyData, isLoading: isLoadingMonthly } = useQuery({
    queryKey: ['monthlyChart', symbol, market],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', symbol)
        .eq('market', market)
        .gte('recorded_at', thirtyDaysAgo.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      
      return data.map(item => ({
        time: new Date(item.recorded_at).toLocaleDateString('th-TH', {
          day: '2-digit',
          month: '2-digit'
        }),
        price: Number(item.price),
        high: Number(item.high_price || item.price),
        low: Number(item.low_price || item.price),
      }));
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Yearly data (last 12 months)
  const { data: yearlyData, isLoading: isLoadingYearly } = useQuery({
    queryKey: ['yearlyChart', symbol, market],
    queryFn: async () => {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', symbol)
        .eq('market', market)
        .gte('recorded_at', twelveMonthsAgo.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      
      // Group by month
      const monthlyGroups: { [key: string]: any[] } = {};
      data.forEach(item => {
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
  });

  // Trend data (2019-2023)
  const { data: trendData, isLoading: isLoadingTrend } = useQuery({
    queryKey: ['trendChart', symbol, market],
    queryFn: async () => {
      const startDate = new Date('2019-01-01');
      const endDate = new Date('2023-12-31');
      
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', symbol)
        .eq('market', market)
        .gte('recorded_at', startDate.toISOString())
        .lte('recorded_at', endDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      
      // Group by year
      const yearlyGroups: { [key: string]: any[] } = {};
      data.forEach(item => {
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
  });

  const isLoading = isLoadingMonthly || isLoadingYearly || isLoadingTrend;

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
        <h2 className="text-xl font-semibold mb-6">{title}</h2>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          กำลังโหลด...
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="glass-card p-6 rounded-lg h-full animate-fade-in flex flex-col">
        <h2 className="text-xl font-semibold mb-6">{title}</h2>
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
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{latestData?.price.toFixed(4)}</div>
          <div className="text-sm text-muted-foreground">{latestData?.time}</div>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="monthly">รายวัน (30 วัน)</TabsTrigger>
          <TabsTrigger value="yearly">รายเดือน (12 เดือน)</TabsTrigger>
          <TabsTrigger value="trend">Trend (2019-2023)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="flex-1 mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                domain={['auto', 'auto']}
                width={50}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
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
                fontSize={10}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                domain={['auto', 'auto']}
                width={50}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                name="ราคาเฉลี่ย"
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

        <TabsContent value="trend" className="flex-1 mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                domain={['auto', 'auto']}
                width={50}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={false}
                name="ราคาเฉลี่ย"
                isAnimationActive={true}
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                dot={false}
                name="สูงสุด"
                strokeDasharray="5 5"
                isAnimationActive={true}
              />
              <Line 
                type="monotone" 
                dataKey="low" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={false}
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

export default RealtimeChart;
