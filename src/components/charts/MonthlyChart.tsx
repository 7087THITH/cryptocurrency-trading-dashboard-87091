import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

interface MonthlyChartProps {
  symbol: string;
  market: string;
}

const MonthlyChart = ({ symbol, market }: MonthlyChartProps) => {
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

      return data.map(item => ({
        date: format(new Date(item.recorded_at), "MM/dd"),
        price: Number(item.price),
        high: Number(item.high_price || item.price),
        low: Number(item.low_price || item.price),
      }));
    },
  });

  if (isLoading) {
    return <div className="h-[300px] flex items-center justify-center">Loading...</div>;
  }

  if (!chartData || chartData.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="price" stroke="#8b5cf6" name="Price" />
        <Line type="monotone" dataKey="high" stroke="#10b981" name="High" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="low" stroke="#ef4444" name="Low" strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyChart;
