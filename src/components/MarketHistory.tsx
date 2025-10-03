import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['marketHistory', selectedSymbol, selectedMarket],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .eq('symbol', selectedSymbol)
        .eq('market', selectedMarket)
        .order('recorded_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      
      return data.map(item => ({
        time: new Date(item.recorded_at).toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        price: Number(item.price),
        high: Number(item.high_price),
        low: Number(item.low_price),
      }));
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Subscribe to realtime updates
  useQuery({
    queryKey: ['realtimeMarket'],
    queryFn: async () => {
      const channel = supabase
        .channel('market-prices-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'market_prices'
          },
          (payload) => {
            console.log('New market data:', payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg animate-pulse">
        <div className="h-64 bg-secondary rounded"></div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-lg animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">ประวัติราคา (50 รายการล่าสุด)</h2>
        
        <div className="flex gap-2">
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
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {selectedMarket === 'FX' && (
                <>
                  <SelectItem value="USD/THB">USD/THB</SelectItem>
                  <SelectItem value="THB/JPY">THB/JPY</SelectItem>
                  <SelectItem value="THB/CNY">THB/CNY</SelectItem>
                  <SelectItem value="USD/CNY">USD/CNY</SelectItem>
                </>
              )}
              {(selectedMarket === 'LME' || selectedMarket === 'SHFE') && (
                <>
                  <SelectItem value="CU">Copper (CU)</SelectItem>
                  <SelectItem value="AL">Aluminum (AL)</SelectItem>
                  <SelectItem value="ZN">Zinc (ZN)</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historyData}>
            <XAxis 
              dataKey="time" 
              stroke="#475569"
              fontSize={12}
            />
            <YAxis 
              stroke="#475569"
              fontSize={12}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#0F172A' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#6366F1" 
              strokeWidth={2}
              dot={false}
              name="ราคา"
            />
            <Line 
              type="monotone" 
              dataKey="high" 
              stroke="#10B981" 
              strokeWidth={1}
              dot={false}
              name="สูงสุด"
              strokeDasharray="5 5"
            />
            <Line 
              type="monotone" 
              dataKey="low" 
              stroke="#EF4444" 
              strokeWidth={1}
              dot={false}
              name="ต่ำสุด"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {historyData && historyData.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          อัพเดทล่าสุด: {historyData[historyData.length - 1]?.time} | 
          ราคา: {historyData[historyData.length - 1]?.price.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default MarketHistory;
