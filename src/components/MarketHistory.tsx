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
    return <div className="glass-card p-6 rounded-lg animate-pulse">
        <div className="h-64 bg-secondary rounded"></div>
      </div>;
  }
  return;
};
export default MarketHistory;