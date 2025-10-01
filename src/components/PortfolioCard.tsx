import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";

const generateCopperPrices = () => {
  // Generate simulated copper price data for 180 days
  const basePrice = 8200;
  return Array.from({ length: 180 }, (_, i) => ({
    date: new Date(Date.now() - (179 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
    price: Math.round(basePrice + Math.sin(i / 10) * 400 + Math.random() * 200)
  }));
};

const PortfolioCard = () => {
  const { data: priceData, isLoading } = useQuery({
    queryKey: ['copperPrices'],
    queryFn: generateCopperPrices,
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
        <h2 className="text-xl font-semibold mb-6">LME Copper (CU)</h2>
        <div className="w-full h-[200px] flex items-center justify-center">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">LME Copper (CU)</h2>
      <div className="w-full h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceData}>
            <XAxis 
              dataKey="date" 
              stroke="#475569"
              fontSize={12}
            />
            <YAxis 
              stroke="#475569"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#0F172A' }}
              itemStyle={{ color: '#6366F1' }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#6366F1" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioCard;