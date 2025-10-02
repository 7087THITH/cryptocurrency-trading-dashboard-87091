import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface SHFEMetal {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

const PortfolioCard = () => {
  const [metals, setMetals] = useState<SHFEMetal[]>([
    { symbol: "CU", name: "Copper", price: 68250, change: 1.2 },
    { symbol: "AL", name: "Aluminum", price: 18950, change: -0.3 },
    { symbol: "ZN", name: "Zinc", price: 21450, change: 0.8 },
    { symbol: "PB", name: "Lead", price: 15680, change: -0.5 },
    { symbol: "NI", name: "Nickel", price: 126500, change: 1.5 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetals((current) =>
        current.map((metal) => ({
          ...metal,
          price: Math.round(metal.price + (Math.random() - 0.5) * 100),
          change: parseFloat((metal.change + (Math.random() - 0.5) * 0.4).toFixed(2)),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">SHFE Metals</h2>
      <div className="space-y-4">
        {metals.map((metal) => (
          <div key={metal.symbol} className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <div className="font-semibold">{metal.symbol}</div>
              <div className="text-xs text-muted-foreground">{metal.name}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">¥{metal.price.toLocaleString()}</div>
              <div className={`text-sm flex items-center gap-1 justify-end ${metal.change >= 0 ? 'text-success' : 'text-warning'}`}>
                {metal.change >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                {Math.abs(metal.change)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioCard;