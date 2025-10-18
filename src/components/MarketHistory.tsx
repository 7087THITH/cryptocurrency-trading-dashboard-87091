import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
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
          <LineChart data={historyData}>
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
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="ราคา"
            />
            <Line 
              type="monotone" 
              dataKey="high" 
              stroke="hsl(var(--success))" 
              strokeWidth={1}
              strokeDasharray="5 5"
              name="สูงสุด"
            />
            <Line 
              type="monotone" 
              dataKey="low" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={1}
              strokeDasharray="5 5"
              name="ต่ำสุด"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
export default MarketHistory;