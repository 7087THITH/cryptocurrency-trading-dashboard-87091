import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface CurrencyPair {
  pair: string;
  price: number;
  change: number;
  high: number;
  low: number;
}

const USDPairsCard = () => {
  const [pairs, setPairs] = useState<CurrencyPair[]>([
    { pair: "USD/THB", price: 36.85, change: 0.42, high: 37.12, low: 36.45 },
    { pair: "USD/CNY", price: 7.24, change: -0.08, high: 7.28, low: 7.21 },
    { pair: "USD/JPY", price: 149.82, change: 0.33, high: 150.25, low: 149.15 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPairs(prevPairs => 
        prevPairs.map(pair => {
          const newPrice = pair.price * (1 + (Math.random() - 0.5) * 0.002);
          return {
            ...pair,
            price: newPrice,
            change: pair.change + (Math.random() - 0.5) * 0.1,
            high: Math.max(pair.high, newPrice),
            low: Math.min(pair.low, newPrice),
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-lg p-4 animate-fade-in">
      <h3 className="text-base font-semibold mb-4 border-b pb-2">USD Pairs</h3>
      <div className="space-y-4">
        {pairs.map((pair) => (
          <div key={pair.pair} className="space-y-1">
            <div className="flex justify-between items-center">
              <p className="font-medium text-sm">{pair.pair}</p>
              <p className="font-semibold text-base">{pair.price.toFixed(3)}</p>
            </div>
            <div className="flex justify-between items-center text-xs">
              <p className="text-muted-foreground">
                H: {pair.high.toFixed(3)} L: {pair.low.toFixed(3)}
              </p>
              <span className={`font-medium flex items-center gap-0.5 ${pair.change >= 0 ? "text-success" : "text-warning"}`}>
                {pair.change >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default USDPairsCard;
