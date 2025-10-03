import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const initialMarketData = [
  { label: "USD/THB", value: "36.75", change: 0.15, prefix: "", flag: "🇹🇭" },
  { label: "THB/JPY", value: "4.08", change: 0.22, prefix: "", flag: "🇹🇭🇯🇵" },
  { label: "THB/CNY", value: "5.07", change: -0.15, prefix: "", flag: "🇹🇭🇨🇳" },
  { label: "USD/CNY", value: "7.24", change: -0.08, prefix: "", flag: "🇺🇸🇨🇳" },
  { label: "SHFE COPPER (CU)", value: "68,750", change: 0.95, prefix: "¥", flag: "🇨🇳" },
  { label: "SHFE ALUMINIUM (AL)", value: "19,850", change: 0.45, prefix: "¥", flag: "🇨🇳" },
  { label: "SHFE ZINC (ZN)", value: "21,450", change: 0.62, prefix: "¥", flag: "🇨🇳" },
  { label: "LME COPPER (CU)", value: "8,245", change: 1.2, prefix: "$", flag: "🇬🇧" },
  { label: "LME ALUMINIUM (AL)", value: "2,485", change: 0.85, prefix: "$", flag: "🇬🇧" },
  { label: "LME ZINC (ZN)", value: "2,645", change: 0.8, prefix: "$", flag: "🇬🇧" },
];

const MarketStats = () => {
  const [marketData, setMarketData] = useState(initialMarketData);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [trendData, setTrendData] = useState<Record<string, any[]>>({});

  // Generate 7-day trend data for each item
  const generateTrendData = (baseValue: string, change: number) => {
    const numValue = parseFloat(baseValue.replace(/,/g, ''));
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const dayChange = (Math.random() - 0.5) * (numValue * 0.02);
      data.push({
        day: i,
        value: numValue + dayChange - (i * (numValue * Math.abs(change) * 0.001))
      });
    }
    return data;
  };

  // Initialize trend data
  useEffect(() => {
    const initialTrends: Record<string, any[]> = {};
    initialMarketData.forEach((item) => {
      initialTrends[item.label] = generateTrendData(item.value, item.change);
    });
    setTrendData(initialTrends);
  }, []);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setMarketData((current) =>
        current.map((item) => ({
          ...item,
          value: item.value.replace(/,/g, '').includes('.') 
            ? (parseFloat(item.value.replace(/,/g, '')) + (Math.random() - 0.5) * 0.1).toFixed(item.value.split('.')[1]?.length || 2)
            : Math.round(parseFloat(item.value.replace(/,/g, '')) + (Math.random() - 0.5) * 50).toLocaleString(),
          change: parseFloat((item.change + (Math.random() - 0.5) * 0.3).toFixed(2)),
        }))
      );
      setLastUpdate(new Date());
    }, 2000);

    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  // Duplicate items for seamless loop
  const duplicatedData = [...marketData, ...marketData];

  return (
    <div className="mb-8 animate-fade-in overflow-hidden">
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .scroll-container {
          animation: scroll 50s linear infinite;
        }
        .scroll-container:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="flex scroll-container gap-4">
        {duplicatedData.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex-shrink-0 w-[280px]">
            <div className="glass-card p-6 rounded-lg h-[200px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl animate-pulse hover:scale-110 transition-transform duration-300 cursor-pointer">
                  {item.flag}
                </span>
                <TrendingUpIcon className={`w-4 h-4 ${item.change >= 0 ? 'text-success' : 'text-warning'}`} />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{item.label}</h3>
              
              {/* Mini Area Chart */}
              <div className="h-16 w-full mb-2 bg-muted/10 rounded">
                {trendData[item.label] && trendData[item.label].length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData[item.label]} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <defs>
                        <linearGradient id={`gradient-${item.label}-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop 
                            offset="5%" 
                            stopColor={item.change >= 0 ? "#22c55e" : "#ef4444"} 
                            stopOpacity={0.4}
                          />
                          <stop 
                            offset="95%" 
                            stopColor={item.change >= 0 ? "#22c55e" : "#ef4444"} 
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={item.change >= 0 ? "#22c55e" : "#ef4444"}
                        strokeWidth={2}
                        fill={`url(#gradient-${item.label}-${index})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              <p className="text-2xl font-semibold">
                {item.prefix}{item.value}
              </p>
              <span className={`text-sm ${item.change >= 0 ? 'text-success' : 'text-warning'} flex items-center gap-1`}>
                {item.change >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                {Math.abs(item.change)}%
              </span>
              <p className="text-xs text-muted-foreground mt-2">
                {format(lastUpdate, "dd/MM/yyyy HH:mm:ss")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketStats;