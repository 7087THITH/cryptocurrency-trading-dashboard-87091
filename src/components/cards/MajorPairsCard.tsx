import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface CurrencyPair {
  pair: string;
  price: number;
  change: number;
  high: number;
  low: number;
}

const MajorPairsCard = () => {
  const [pairs, setPairs] = useState<CurrencyPair[]>([
    { pair: "EUR/USD", price: 1.085, change: 0.15, high: 1.089, low: 1.082 },
    { pair: "GBP/USD", price: 1.267, change: -0.22, high: 1.272, low: 1.264 },
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
    <div className="glass-card rounded-lg p-3 animate-fade-in">
      <h3 className="text-sm font-semibold mb-2">Major Pairs</h3>
      <div className="space-y-2">
        {pairs.map((pair) => (
          <div key={pair.pair} className="flex justify-between items-center text-xs border-t border-secondary pt-2">
            <div>
              <p className="font-medium">{pair.pair}</p>
              <p className="text-[10px] text-muted-foreground">
                H: {pair.high.toFixed(3)} L: {pair.low.toFixed(3)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{pair.price.toFixed(3)}</p>
              <span className={`flex items-center gap-0.5 justify-end ${pair.change >= 0 ? "text-success" : "text-warning"}`}>
                {pair.change >= 0 ? <ArrowUpIcon className="w-2.5 h-2.5" /> : <ArrowDownIcon className="w-2.5 h-2.5" />}
                {Math.abs(pair.change).toFixed(2)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MajorPairsCard;
