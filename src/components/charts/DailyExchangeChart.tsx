import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface DailyExchangeChartProps {
  currency: string;
  month: number;
  year: number;
}

const DailyExchangeChart = ({ currency, month, year }: DailyExchangeChartProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["exchange-rates", currency, month, year],
    queryFn: async () => {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const { data, error } = await supabase
        .from("historical_exchange_rates")
        .select("*")
        .eq("currency", currency)
        .gte("data_date", startDate.toISOString().split("T")[0])
        .lte("data_date", endDate.toISOString().split("T")[0])
        .order("data_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const chartData = data?.map((item) => ({
    date: new Date(item.data_date).getDate(),
    rate: parseFloat(item.exchange_rate?.toString() || "0"),
  })) || [];

  const average = chartData.length > 0
    ? chartData.reduce((sum, item) => sum + item.rate, 0) / chartData.length
    : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{currency}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{currency}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currency} (TTS)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
              className="text-muted-foreground"
            />
            <YAxis 
              domain={['auto', 'auto']}
              className="text-muted-foreground"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Average: <span className="font-bold text-foreground">{average.toFixed(4)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyExchangeChart;