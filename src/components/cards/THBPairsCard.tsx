import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface CurrencyPair {
  pair: string;
  price: number;
  change: number;
  high: number;
  low: number;
}

const THBPairsCard = () => {
  const [pairs, setPairs] = useState<CurrencyPair[]>([
    { pair: "THB/JPY", price: 4.18, change: -0.15, high: 4.25, low: 4.15 },
    { pair: "THB/CNY", price: 0.267, change: 0.28, high: 0.271, low: 0.264 },
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
      <h3 className="text-base font-semibold mb-4 border-b pb-2">THB Pairs</h3>
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

export default THBPairsCard;
