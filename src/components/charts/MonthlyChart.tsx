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
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // วันที่ 15 เดือนก่อนหน้า
      const date15PrevMonth = new Date(currentYear, currentMonth - 1, 15);
      // วันที่ 30 เดือนก่อนหน้า
      const date30PrevMonth = new Date(currentYear, currentMonth - 1, 30);
      // วันที่ 15 เดือนปัจจุบัน
      const date15CurrentMonth = new Date(currentYear, currentMonth, 15);
      
      const targetDates = [date15PrevMonth, date30PrevMonth, date15CurrentMonth];
      
      // ดึงข้อมูลในช่วง 45 วันย้อนหลัง
      const startDate = subDays(date15PrevMonth, 2);
      const endDate = new Date(currentYear, currentMonth, 17);
      
      const { data, error } = await supabase
        .from("market_prices")
        .select("*")
        .eq("symbol", symbol)
        .eq("market", market)
        .gte("recorded_at", startDate.toISOString())
        .lte("recorded_at", endDate.toISOString())
        .order("recorded_at", { ascending: true });

      if (error) throw error;

      // หาข้อมูลที่ใกล้เคียงกับวันที่เป้าหมาย
      const mappedData = targetDates.map(targetDate => {
        // หาข้อมูลที่ใกล้เคียงวันที่เป้าหมายที่สุด
        const closestData = data.reduce((closest, item) => {
          const itemDate = new Date(item.recorded_at);
          const itemDiff = Math.abs(itemDate.getTime() - targetDate.getTime());
          const closestDiff = closest 
            ? Math.abs(new Date(closest.recorded_at).getTime() - targetDate.getTime())
            : Infinity;
          
          return itemDiff < closestDiff ? item : closest;
        }, null as any);

        if (closestData) {
          return {
            date: format(targetDate, "d MMM''yy"),
            price: Number(closestData.price),
            high: Number(closestData.high_price || closestData.price),
            low: Number(closestData.low_price || closestData.price),
          };
        }
        
        // ถ้าไม่มีข้อมูล ให้ใช้ค่า 0
        return {
          date: format(targetDate, "d MMM''yy"),
          price: 0,
          high: 0,
          low: 0,
        };
      });
      
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
            // รีเฟรชข้อมูลใหม่เมื่อมีการอัปเดต
            const newItem = payload.new as any;
            const newItemDate = new Date(newItem.recorded_at);
            const day = newItemDate.getDate();
            
            // เช็คว่าเป็นวันที่ 15 หรือ 30 หรือไม่
            if (day === 15 || day === 30) {
              setRealtimeData(prev => {
                const targetDateStr = format(newItemDate, "d MMM''yy");
                const existingIndex = prev.findIndex(item => item.date === targetDateStr);
                
                const formattedItem = {
                  date: targetDateStr,
                  price: Number(newItem.price),
                  high: Number(newItem.high_price || newItem.price),
                  low: Number(newItem.low_price || newItem.price),
                };
                
                if (existingIndex >= 0) {
                  const updated = [...prev];
                  updated[existingIndex] = formattedItem;
                  return updated;
                }
                
                return prev;
              });
            }
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
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
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
        <XAxis 
          dataKey="date"
          interval={0}
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="high" 
          stroke="#10b981" 
          fill="url(#colorHigh)" 
          name="High" 
          strokeWidth={1}
          strokeDasharray="5 5"
        />
        <Area 
          type="monotone" 
          dataKey="price" 
          stroke="#3b82f6" 
          fill="url(#colorPrice)" 
          name="Price" 
          strokeWidth={2}
          dot={{ r: 0 }}
          activeDot={{ 
            r: 6, 
            fill: '#3b82f6',
            stroke: '#ffffff',
            strokeWidth: 2
          }}
        />
        <Area 
          type="monotone" 
          dataKey="low" 
          stroke="#ef4444" 
          fill="url(#colorLow)" 
          name="Low"
          strokeWidth={1}
          strokeDasharray="5 5"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MonthlyChart;
