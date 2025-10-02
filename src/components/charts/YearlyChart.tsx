import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";

interface YearlyChartProps {
  symbol: string;
  market: string;
}

const YearlyChart = ({ symbol, market }: YearlyChartProps) => {
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

      return Object.values(monthlyData).map((item: any) => ({
        month: item.month,
        avgPrice: item.prices.reduce((a: number, b: number) => a + b, 0) / item.prices.length,
        avgHigh: item.highs.reduce((a: number, b: number) => a + b, 0) / item.highs.length,
        avgLow: item.lows.reduce((a: number, b: number) => a + b, 0) / item.lows.length,
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
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="avgPrice" stroke="#8b5cf6" name="Avg Price" />
        <Line type="monotone" dataKey="avgHigh" stroke="#10b981" name="Avg High" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="avgLow" stroke="#ef4444" name="Avg Low" strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default YearlyChart;
