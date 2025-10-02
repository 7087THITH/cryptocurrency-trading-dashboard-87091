import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";

interface RealtimeChartProps {
  symbol: string;
  market: string;
  title: string;
}

const RealtimeChart = ({ symbol, market, title }: RealtimeChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);

  const { data: initialData, isLoading } = useQuery({
    queryKey: ['realtimeChart', symbol, market],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', symbol)
        .eq('market', market)
        .order('recorded_at', { ascending: true })
        .limit(30);

      if (error) throw error;
      
      return data.map(item => ({
        time: new Date(item.recorded_at).toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        price: Number(item.price),
        high: Number(item.high_price || item.price),
        low: Number(item.low_price || item.price),
      }));
    },
  });

  useEffect(() => {
    if (initialData) {
      setChartData(initialData);
    }
  }, [initialData]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${symbol}-${market}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_prices',
          filter: `symbol=eq.${symbol},market=eq.${market}`
        },
        (payload) => {
          const newData = {
            time: new Date(payload.new.recorded_at).toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            price: Number(payload.new.price),
            high: Number(payload.new.high_price || payload.new.price),
            low: Number(payload.new.low_price || payload.new.price),
          };
          
          setChartData(prev => {
            const updated = [...prev, newData];
            return updated.slice(-30); // Keep only last 30 points
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [symbol, market]);

  if (isLoading) {
    return (
      <div className="glass-card p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          กำลังโหลด...
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="glass-card p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          ไม่มีข้อมูล
        </div>
      </div>
    );
  }

  const latestData = chartData[chartData.length - 1];

  return (
    <div className="glass-card p-4 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-right">
          <div className="text-xl font-bold text-primary">{latestData?.price.toFixed(4)}</div>
          <div className="text-xs text-muted-foreground">{latestData?.time}</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
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
    </div>
  );
};

export default RealtimeChart;
