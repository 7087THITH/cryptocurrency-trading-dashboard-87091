import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";

interface YearlyChartProps {
  symbol: string;
  market: string;
}

const YearlyChart = ({ symbol, market }: YearlyChartProps) => {
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["yearly-chart", symbol, market],
    queryFn: async () => {
      const twelveMonthsAgo = subMonths(new Date(), 12);
      
      const { data, error } = await supabase
        .from("market_prices")
        .select("*")
        .eq("symbol", symbol)
        .eq("market", market)
        .gte("recorded_at", twelveMonthsAgo.toISOString())
        .order("recorded_at", { ascending: true });

      if (error) throw error;

      // Group by month and calculate average
      const monthlyData = data.reduce((acc: any, item) => {
        const month = format(startOfMonth(new Date(item.recorded_at)), "MMM yyyy");
        if (!acc[month]) {
          acc[month] = {
            month,
            prices: [],
            highs: [],
            lows: [],
          };
        }
        acc[month].prices.push(Number(item.price));
        acc[month].highs.push(Number(item.high_price || item.price));
        acc[month].lows.push(Number(item.low_price || item.price));
        return acc;
      }, {});

      const mappedData = Object.values(monthlyData).map((item: any) => ({
        month: item.month,
        avgPrice: item.prices.reduce((a: number, b: number) => a + b, 0) / item.prices.length,
        avgHigh: item.highs.reduce((a: number, b: number) => a + b, 0) / item.highs.length,
        avgLow: item.lows.reduce((a: number, b: number) => a + b, 0) / item.lows.length,
      }));
      
      setRealtimeData(mappedData);
      return mappedData;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('yearly-chart-changes')
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
            // Refetch to recalculate averages
            const twelveMonthsAgo = subMonths(new Date(), 12);
            
            supabase
              .from("market_prices")
              .select("*")
              .eq("symbol", symbol)
              .eq("market", market)
              .gte("recorded_at", twelveMonthsAgo.toISOString())
              .order("recorded_at", { ascending: true })
              .then(({ data, error }) => {
                if (error || !data) return;

                const monthlyData = data.reduce((acc: any, item) => {
                  const month = format(startOfMonth(new Date(item.recorded_at)), "MMM yyyy");
                  if (!acc[month]) {
                    acc[month] = {
                      month,
                      prices: [],
                      highs: [],
                      lows: [],
                    };
                  }
                  acc[month].prices.push(Number(item.price));
                  acc[month].highs.push(Number(item.high_price || item.price));
                  acc[month].lows.push(Number(item.low_price || item.price));
                  return acc;
                }, {});

                const mappedData = Object.values(monthlyData).map((item: any) => ({
                  month: item.month,
                  avgPrice: item.prices.reduce((a: number, b: number) => a + b, 0) / item.prices.length,
                  avgHigh: item.highs.reduce((a: number, b: number) => a + b, 0) / item.highs.length,
                  avgLow: item.lows.reduce((a: number, b: number) => a + b, 0) / item.lows.length,
                }));
                
                setRealtimeData(mappedData);
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
          <linearGradient id="colorAvgPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorAvgHigh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="colorAvgLow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="avgHigh" stroke="#10b981" fill="url(#colorAvgHigh)" name="Avg High" />
        <Area type="monotone" dataKey="avgPrice" stroke="#8b5cf6" fill="url(#colorAvgPrice)" name="Avg Price" strokeWidth={2} />
        <Area type="monotone" dataKey="avgLow" stroke="#ef4444" fill="url(#colorAvgLow)" name="Avg Low" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default YearlyChart;
