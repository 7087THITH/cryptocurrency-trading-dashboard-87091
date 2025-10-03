import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface CurrencyPair {
  pair: string;
  price: number;
  change: number;
  volume: string;
  high: number;
  low: number;
}

const CurrencyPairs = () => {
  const [pairs, setPairs] = useState<CurrencyPair[]>([
    { pair: "USD/THB", price: 36.85, change: 0.42, volume: "2.4B", high: 37.12, low: 36.45 },
    { pair: "THB/JPY", price: 4.18, change: -0.15, volume: "1.8B", high: 4.25, low: 4.15 },
    { pair: "THB/CNY", price: 0.267, change: 0.28, volume: "3.2B", high: 0.271, low: 0.264 },
    { pair: "USD/CNY", price: 7.24, change: -0.08, volume: "5.6B", high: 7.28, low: 7.21 },
    { pair: "EUR/USD", price: 1.085, change: 0.15, volume: "8.2B", high: 1.089, low: 1.082 },
    { pair: "GBP/USD", price: 1.267, change: -0.22, volume: "4.5B", high: 1.272, low: 1.264 },
    { pair: "USD/JPY", price: 149.82, change: 0.33, volume: "9.1B", high: 150.25, low: 149.15 },
  ]);

  // Simulate real-time price updates
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
    <div className="glass-card rounded-lg p-4 mb-8 animate-fade-in">
      <h2 className="text-lg font-semibold mb-3">Currency Pairs</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-2">Pair</th>
              <th className="pb-2">Price</th>
              <th className="pb-2">Change</th>
              <th className="pb-2">High</th>
              <th className="pb-2">Low</th>
              <th className="pb-2">Volume</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => (
              <tr key={pair.pair} className="border-t border-secondary">
                <td className="py-2">
                  <p className="font-medium">{pair.pair}</p>
                </td>
                <td className="py-2">{pair.price.toFixed(3)}</td>
                <td className="py-2">
                  <span
                    className={`flex items-center gap-1 ${
                      pair.change >= 0 ? "text-success" : "text-warning"
                    }`}
                  >
                    {pair.change >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    {Math.abs(pair.change).toFixed(2)}%
                  </span>
                </td>
                <td className="py-2 text-muted-foreground">{pair.high.toFixed(3)}</td>
                <td className="py-2 text-muted-foreground">{pair.low.toFixed(3)}</td>
                <td className="py-2">${pair.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrencyPairs;
