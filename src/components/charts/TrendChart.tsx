import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfYear } from "date-fns";

interface TrendChartProps {
  symbol: string;
  market: string;
}

const TrendChart = ({ symbol, market }: TrendChartProps) => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["trend-chart", symbol, market],
    queryFn: async () => {
      // Query historical data from 2019-2023
      const { data, error } = await supabase
        .from("market_prices")
        .select("*")
        .eq("symbol", symbol)
        .eq("market", market)
        .gte("recorded_at", "2019-01-01T00:00:00Z")
        .lte("recorded_at", "2023-12-31T23:59:59Z")
        .order("recorded_at", { ascending: true });

      if (error) throw error;

      // Group by year and calculate average
      const yearlyData = data.reduce((acc: any, item) => {
        const year = format(startOfYear(new Date(item.recorded_at)), "yyyy");
        if (!acc[year]) {
          acc[year] = {
            year,
            prices: [],
            highs: [],
            lows: [],
          };
        }
        acc[year].prices.push(Number(item.price));
        acc[year].highs.push(Number(item.high_price || item.price));
        acc[year].lows.push(Number(item.low_price || item.price));
        return acc;
      }, {});

      return Object.values(yearlyData).map((item: any) => ({
        year: item.year,
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
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available (2019-2023)</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="avgPrice" stroke="#8b5cf6" name="Avg Price" strokeWidth={2} />
        <Line type="monotone" dataKey="avgHigh" stroke="#10b981" name="Avg High" strokeDasharray="5 5" />
        <Line type="monotone" dataKey="avgLow" stroke="#ef4444" name="Avg Low" strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
