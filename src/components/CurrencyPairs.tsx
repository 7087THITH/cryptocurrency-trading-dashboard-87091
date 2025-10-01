import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface CurrencyPair {
  pair: string;
  price: number;
  change: number;
  volume: string;
}

const CurrencyPairs = () => {
  const [pairs, setPairs] = useState<CurrencyPair[]>([
    { pair: "USD/TB", price: 36.85, change: 0.42, volume: "2.4B" },
    { pair: "TB/JPY", price: 4.18, change: -0.15, volume: "1.8B" },
    { pair: "TB/CNY", price: 0.267, change: 0.28, volume: "3.2B" },
    { pair: "USD/CNY", price: 7.24, change: -0.08, volume: "5.6B" },
  ]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPairs(prevPairs => 
        prevPairs.map(pair => ({
          ...pair,
          price: pair.price * (1 + (Math.random() - 0.5) * 0.002),
          change: pair.change + (Math.random() - 0.5) * 0.1,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-lg p-6 mb-8 animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">Currency Pairs</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-4">Pair</th>
              <th className="pb-4">Price</th>
              <th className="pb-4">24h Change</th>
              <th className="pb-4">Volume</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((pair) => (
              <tr key={pair.pair} className="border-t border-secondary">
                <td className="py-4">
                  <p className="font-medium">{pair.pair}</p>
                </td>
                <td className="py-4">{pair.price.toFixed(3)}</td>
                <td className="py-4">
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
                <td className="py-4">${pair.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrencyPairs;
