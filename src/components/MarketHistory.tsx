import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
const MarketHistory = () => {
  const [selectedSymbol, setSelectedSymbol] = useState(() => {
    const saved = localStorage.getItem('marketHistory-symbol');
    return saved || "USD/THB";
  });
  const [selectedMarket, setSelectedMarket] = useState(() => {
    const saved = localStorage.getItem('marketHistory-market');
    return saved || "FX";
  });
  const handleMarketChange = (value: string) => {
    setSelectedMarket(value);
    localStorage.setItem('marketHistory-market', value);
    // Reset symbol when market changes
    const newSymbol = value === 'FX' ? 'USD/THB' : 'CU';
    setSelectedSymbol(newSymbol);
    localStorage.setItem('marketHistory-symbol', newSymbol);
  };
  const handleSymbolChange = (value: string) => {
    setSelectedSymbol(value);
    localStorage.setItem('marketHistory-symbol', value);
  };
  const {
    data: historyData,
    isLoading
  } = useQuery({
    queryKey: ['marketHistory', selectedSymbol, selectedMarket],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('market_prices').select('*').eq('symbol', selectedSymbol).eq('market', selectedMarket).order('recorded_at', {
        ascending: true
      }).limit(50);
      if (error) throw error;
      return data.map(item => ({
        time: new Date(item.recorded_at).toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        price: Number(item.price),
        high: Number(item.high_price),
        low: Number(item.low_price)
      }));
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Subscribe to realtime updates
  useQuery({
    queryKey: ['realtimeMarket'],
    queryFn: async () => {
      const channel = supabase.channel('market-prices-changes').on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'market_prices'
      }, payload => {
        console.log('New market data:', payload);
      }).subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  });
  if (isLoading) {
    return <div className="text-muted-foreground">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={selectedMarket} onValueChange={handleMarketChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FX">FX</SelectItem>
            <SelectItem value="LME">LME</SelectItem>
            <SelectItem value="SHFE">SHFE</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedSymbol} onValueChange={handleSymbolChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectedMarket === 'FX' && (
              <>
                <SelectItem value="USD/THB">USD/THB</SelectItem>
                <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                <SelectItem value="JPY/USD">JPY/USD</SelectItem>
              </>
            )}
            {selectedMarket === 'LME' && (
              <>
                <SelectItem value="CU">Copper</SelectItem>
                <SelectItem value="AL">Aluminum</SelectItem>
                <SelectItem value="ZN">Zinc</SelectItem>
                <SelectItem value="NI">Nickel</SelectItem>
                <SelectItem value="PB">Lead</SelectItem>
                <SelectItem value="SN">Tin</SelectItem>
              </>
            )}
            {selectedMarket === 'SHFE' && (
              <>
                <SelectItem value="CU">Copper</SelectItem>
                <SelectItem value="AL">Aluminum</SelectItem>
                <SelectItem value="ZN">Zinc</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {historyData && historyData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={historyData}>
            <defs>
              <linearGradient id="colorMarketPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="colorMarketHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.02}/>
              </linearGradient>
              <linearGradient id="colorMarketLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="high" 
              stroke="hsl(var(--success))" 
              fill="url(#colorMarketHigh)"
              strokeWidth={1}
              strokeDasharray="5 5"
              name="สูงสุด"
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))" 
              fill="url(#colorMarketPrice)"
              strokeWidth={2}
              name="ราคา"
              dot={{ r: 0 }}
              activeDot={{ 
                r: 6, 
                fill: 'hsl(var(--primary))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
              }}
            />
            <Area 
              type="monotone" 
              dataKey="low" 
              stroke="hsl(var(--destructive))" 
              fill="url(#colorMarketLow)"
              strokeWidth={1}
              strokeDasharray="5 5"
              name="ต่ำสุด"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
export default MarketHistory;