import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

type ChartType = 'exchange' | 'lme' | 'shfe';
type ViewType = 'monthly' | 'yearly' | 'trend';

export const HistoricalChart = () => {
  const [chartType, setChartType] = useState<ChartType>(() => {
    const saved = localStorage.getItem('historicalChart-type');
    return (saved as ChartType) || 'exchange';
  });
  const [viewType, setViewType] = useState<ViewType>(() => {
    const saved = localStorage.getItem('historicalChart-view');
    return (saved as ViewType) || 'monthly';
  });
  const [selectedSymbol, setSelectedSymbol] = useState<string>(() => {
    const saved = localStorage.getItem('historicalChart-symbol');
    return saved || 'USD';
  });

  // Update symbol when chart type changes
  const handleChartTypeChange = (newType: ChartType) => {
    setChartType(newType);
    localStorage.setItem('historicalChart-type', newType);
    const newSymbol = newType === 'exchange' ? 'USD' : 'CU';
    setSelectedSymbol(newSymbol);
    localStorage.setItem('historicalChart-symbol', newSymbol);
  };

  const handleViewTypeChange = (newView: ViewType) => {
    setViewType(newView);
    localStorage.setItem('historicalChart-view', newView);
  };

  const handleSymbolChange = (newSymbol: string) => {
    setSelectedSymbol(newSymbol);
    localStorage.setItem('historicalChart-symbol', newSymbol);
  };

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['historical-data', chartType, viewType, selectedSymbol],
    queryFn: async () => {
      const now = new Date();
      let startDate = new Date();
      
      if (viewType === 'monthly') {
        startDate.setDate(now.getDate() - 30);
      } else if (viewType === 'yearly') {
        startDate.setMonth(now.getMonth() - 12);
      } else {
        startDate = new Date('2019-01-01');
      }

      if (chartType === 'exchange') {
        const { data, error } = await supabase
          .from('historical_exchange_rates')
          .select('*')
          .eq('currency', selectedSymbol)
          .gte('data_date', startDate.toISOString().split('T')[0])
          .order('data_date', { ascending: true });

        if (error) throw error;

        return data?.map(item => ({
          date: new Date(item.data_date).toLocaleDateString('th-TH', { 
            month: 'short', 
            day: 'numeric',
            year: viewType === 'trend' ? 'numeric' : undefined 
          }),
          value: Number(item.exchange_rate || item.selling_price || 0),
        })) || [];
      } else if (chartType === 'lme') {
        const { data, error } = await supabase
          .from('historical_lme_prices')
          .select('*')
          .eq('metal', selectedSymbol)
          .gte('data_date', startDate.toISOString().split('T')[0])
          .order('data_date', { ascending: true });

        if (error) throw error;

        return data?.map(item => ({
          date: new Date(item.data_date).toLocaleDateString('th-TH', { 
            month: 'short', 
            day: 'numeric',
            year: viewType === 'trend' ? 'numeric' : undefined 
          }),
          value: Number(item.price_usd),
        })) || [];
      } else {
        const { data, error } = await supabase
          .from('historical_shfe_prices')
          .select('*')
          .eq('metal', selectedSymbol)
          .gte('data_date', startDate.toISOString().split('T')[0])
          .order('data_date', { ascending: true });

        if (error) throw error;

        return data?.map(item => ({
          date: new Date(item.data_date).toLocaleDateString('th-TH', { 
            month: 'short', 
            day: 'numeric',
            year: viewType === 'trend' ? 'numeric' : undefined 
          }),
          value: Number(item.price_cny),
        })) || [];
      }
    },
    refetchInterval: 60000,
  });

  const symbols = {
    exchange: ['USD', 'JPY', 'CNY', 'CNY/USD'],
    lme: ['CU', 'AL', 'ZN'],
    shfe: ['CU', 'AL', 'ZN'],
  };

  return (
    <Card className="p-6">
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <Select value={chartType} onValueChange={(v) => handleChartTypeChange(v as ChartType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="exchange">อัตราแลกเปลี่ยน</SelectItem>
              <SelectItem value="lme">LME</SelectItem>
              <SelectItem value="shfe">SHFE</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSymbol} onValueChange={handleSymbolChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกสกุล/โลหะ" />
            </SelectTrigger>
            <SelectContent>
              {symbols[chartType].map(symbol => (
                <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={viewType} onValueChange={(v) => handleViewTypeChange(v as ViewType)}>
          <TabsList>
            <TabsTrigger value="monthly">รายเดือน (30 วัน)</TabsTrigger>
            <TabsTrigger value="yearly">รายปี (12 เดือน)</TabsTrigger>
            <TabsTrigger value="trend">แนวโน้ม (2019-2023)</TabsTrigger>
          </TabsList>

          <TabsContent value={viewType} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    className="text-sm"
                  />
                  <YAxis className="text-sm" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    name={selectedSymbol}
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                ไม่มีข้อมูลในช่วงเวลาที่เลือก กรุณานำเข้าข้อมูลจาก Excel ก่อน
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
