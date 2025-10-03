import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { format, subDays, subMonths, startOfMonth } from "date-fns";

interface ChartBlockProps {
  title: string;
  symbols: { label: string; market: string; symbol: string }[];
}

const ChartBlock = ({ title, symbols }: ChartBlockProps) => {
  const [selectedSymbol, setSelectedSymbol] = useState(0);
  const currentSymbol = symbols[selectedSymbol];

  // Fetch monthly data (last 30 days)
  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthly-chart', currentSymbol.symbol, currentSymbol.market],
    queryFn: async () => {
      const startDate = subDays(new Date(), 30);
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', currentSymbol.symbol)
        .eq('market', currentSymbol.market)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      return data?.map(item => ({
        date: format(new Date(item.recorded_at), 'dd/MM'),
        price: item.price,
        high: item.high_price,
        low: item.low_price,
      })) || [];
    },
    refetchInterval: 60000,
  });

  // Fetch yearly data (last 12 months)
  const { data: yearlyData, isLoading: yearlyLoading } = useQuery({
    queryKey: ['yearly-chart', currentSymbol.symbol, currentSymbol.market],
    queryFn: async () => {
      const startDate = subMonths(new Date(), 12);
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', currentSymbol.symbol)
        .eq('market', currentSymbol.market)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      const monthlyAverages = new Map();
      data?.forEach(item => {
        const monthKey = format(startOfMonth(new Date(item.recorded_at)), 'MMM yy');
        if (!monthlyAverages.has(monthKey)) {
          monthlyAverages.set(monthKey, { prices: [], highs: [], lows: [] });
        }
        const entry = monthlyAverages.get(monthKey);
        entry.prices.push(item.price);
        entry.highs.push(item.high_price);
        entry.lows.push(item.low_price);
      });

      return Array.from(monthlyAverages.entries()).map(([month, values]) => ({
        date: month,
        price: values.prices.reduce((a: number, b: number) => a + b, 0) / values.prices.length,
        high: Math.max(...values.highs),
        low: Math.min(...values.lows),
      }));
    },
    refetchInterval: 60000,
  });

  // Fetch trend data (2021-2025)
  const { data: trendData, isLoading: trendLoading } = useQuery({
    queryKey: ['trend-chart', currentSymbol.symbol, currentSymbol.market],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', currentSymbol.symbol)
        .eq('market', currentSymbol.market)
        .gte('recorded_at', '2021-01-01')
        .lte('recorded_at', '2025-12-31')
        .order('recorded_at', { ascending: true });

      if (error) throw error;

      const yearlyAverages = new Map();
      data?.forEach(item => {
        const year = new Date(item.recorded_at).getFullYear().toString();
        if (!yearlyAverages.has(year)) {
          yearlyAverages.set(year, { prices: [], highs: [], lows: [] });
        }
        const entry = yearlyAverages.get(year);
        entry.prices.push(item.price);
        entry.highs.push(item.high_price);
        entry.lows.push(item.low_price);
      });

      return Array.from(yearlyAverages.entries()).map(([year, values]) => ({
        date: year,
        price: values.prices.reduce((a: number, b: number) => a + b, 0) / values.prices.length,
        high: Math.max(...values.highs),
        low: Math.min(...values.lows),
      }));
    },
    refetchInterval: 60000,
  });

  return (
    <Card className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      {/* Symbol selector */}
      <div className="flex gap-2 mb-4">
        {symbols.map((sym, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedSymbol(idx)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedSymbol === idx
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {sym.label}
          </button>
        ))}
      </div>

      <Tabs defaultValue="monthly" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">1-30 วัน</TabsTrigger>
          <TabsTrigger value="yearly">1 ปี</TabsTrigger>
          <TabsTrigger value="trend">2021-2025</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="h-[400px]">
          {monthlyLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" name="ราคา" />
                <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" name="สูงสุด" />
                <Line type="monotone" dataKey="low" stroke="hsl(var(--warning))" name="ต่ำสุด" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </TabsContent>

        <TabsContent value="yearly" className="h-[400px]">
          {yearlyLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" name="ราคา" />
                <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" name="สูงสุด" />
                <Line type="monotone" dataKey="low" stroke="hsl(var(--warning))" name="ต่ำสุด" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </TabsContent>

        <TabsContent value="trend" className="h-[400px]">
          {trendLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" name="ราคา" />
                <Line type="monotone" dataKey="high" stroke="hsl(var(--success))" name="สูงสุด" />
                <Line type="monotone" dataKey="low" stroke="hsl(var(--warning))" name="ต่ำสุด" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

const MultiBlockCharts = () => {
  const block1Symbols = [
    { label: "USD/THB", market: "FX", symbol: "USDTHB" },
    { label: "THB/JPY", market: "FX", symbol: "THBJPY" },
    { label: "THB/CNY", market: "FX", symbol: "THBCNY" },
  ];

  const block2Symbols = [
    { label: "USD/CNY", market: "FX", symbol: "USDCNY" },
    { label: "SHFE COPPER (CU)", market: "SHFE", symbol: "CU" },
    { label: "LME COPPER (CU)", market: "LME", symbol: "CU" },
  ];

  const block3Symbols = [
    { label: "USD/CNY", market: "FX", symbol: "USDCNY" },
    { label: "SHFE ALUMINIUM (AL)", market: "SHFE", symbol: "AL" },
    { label: "LME ALUMINIUM (AL)", market: "LME", symbol: "AL" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <ChartBlock title="บล็อคที่ 1: คู่สกุลเงิน THB" symbols={block1Symbols} />
      <ChartBlock title="บล็อคที่ 2: USD/CNY และ Copper" symbols={block2Symbols} />
      <ChartBlock title="บล็อคที่ 3: USD/CNY และ Aluminium" symbols={block3Symbols} />
    </div>
  );
};

export default MultiBlockCharts;
