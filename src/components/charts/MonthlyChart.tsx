import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { useEffect, useState } from "react";

interface MonthlyChartProps {
  symbol: string;
  market: string;
}

const MonthlyChart = ({ symbol, market }: MonthlyChartProps) => {
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["monthly-chart", symbol, market],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data, error } = await supabase
        .from("market_prices")
        .select("*")
        .eq("symbol", symbol)
        .eq("market", market)
        .gte("recorded_at", thirtyDaysAgo.toISOString())
        .order("recorded_at", { ascending: true });

      if (error) throw error;

      const mappedData = data.map(item => ({
        date: format(new Date(item.recorded_at), "d MMM''yy"),
        price: Number(item.price),
        high: Number(item.high_price || item.price),
        low: Number(item.low_price || item.price),
      }));
      
      setRealtimeData(mappedData);
      return mappedData;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('monthly-chart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_prices',
          filter: `symbol=eq.${symbol},market=eq.${market}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newItem = payload.new as any;
            const formattedItem = {
              date: format(new Date(newItem.recorded_at), "d MMM''yy"),
              price: Number(newItem.price),
              high: Number(newItem.high_price || newItem.price),
              low: Number(newItem.low_price || newItem.price),
            };
            
            setRealtimeData(prev => {
              const filtered = prev.filter(item => item.date !== formattedItem.date);
              return [...filtered, formattedItem].sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
              );
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [symbol, market]);

  if (isLoading) {
    return <div className="h-[300px] flex items-center justify-center">Loading...</div>;
  }

  const displayData = realtimeData.length > 0 ? realtimeData : chartData;

  if (!displayData || displayData.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={displayData}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="high" stroke="#10b981" fill="url(#colorHigh)" name="High" />
        <Area type="monotone" dataKey="price" stroke="#8b5cf6" fill="url(#colorPrice)" name="Price" strokeWidth={2} />
        <Area type="monotone" dataKey="low" stroke="#ef4444" fill="url(#colorLow)" name="Low" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MonthlyChart;
