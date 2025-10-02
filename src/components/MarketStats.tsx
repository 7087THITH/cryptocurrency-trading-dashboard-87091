import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";
import { useState, useEffect } from "react";

const marketDataSets = [
  [
    { label: "USD/CNY", value: "7.24", change: -0.08, prefix: "" },
    { label: "LME Copper", value: "8,245", change: 1.2, prefix: "$" },
    { label: "SHFE Aluminum", value: "18,950", change: -0.3, prefix: "¥" },
  ],
  [
    { label: "USD/THB", value: "36.75", change: 0.15, prefix: "฿" },
    { label: "EUR/USD", value: "1.0842", change: -0.22, prefix: "" },
    { label: "LME Zinc", value: "2,645", change: 0.8, prefix: "$" },
  ],
  [
    { label: "USD/JPY", value: "149.82", change: 0.45, prefix: "¥" },
    { label: "SHFE Copper", value: "68,250", change: 1.5, prefix: "¥" },
    { label: "Gold", value: "2,045", change: 0.6, prefix: "$" },
  ],
  [
    { label: "GBP/USD", value: "1.2634", change: -0.18, prefix: "" },
    { label: "SHFE Zinc", value: "21,450", change: -0.5, prefix: "¥" },
    { label: "LME Aluminum", value: "2,245", change: 0.9, prefix: "$" },
  ],
];

const MarketStats = () => {
  const [currentSet, setCurrentSet] = useState(0);
  const [marketData, setMarketData] = useState(marketDataSets[0]);

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setCurrentSet((prev) => {
        const next = (prev + 1) % marketDataSets.length;
        setMarketData(marketDataSets[next]);
        return next;
      });
    }, 4000);

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
    }, 2000);

    return () => {
      clearInterval(rotateInterval);
      clearInterval(updateInterval);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
      {marketData.map((item, index) => (
        <div key={`${item.label}-${index}`} className="glass-card p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{item.label}</h3>
            <TrendingUpIcon className={`w-4 h-4 ${item.change >= 0 ? 'text-success' : 'text-warning'}`} />
          </div>
          <p className="text-2xl font-semibold mt-2">
            {item.prefix}{item.value}
          </p>
          <span className={`text-sm ${item.change >= 0 ? 'text-success' : 'text-warning'} flex items-center gap-1`}>
            {item.change >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
            {Math.abs(item.change)}%
          </span>
        </div>
      ))}
    </div>
  );
};

export default MarketStats;