import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface MetalData {
  symbol: string;
  name: string;
  lmePrice: number;
  shfePrice: number;
  lmeChange: number;
  shfeChange: number;
}

const CopperAluminumCard = () => {
  const [metals, setMetals] = useState<MetalData[]>([
    { symbol: "CU", name: "Copper", lmePrice: 8245, shfePrice: 68420, lmeChange: 1.2, shfeChange: 0.8 },
    { symbol: "AL", name: "Aluminum", lmePrice: 2156, shfePrice: 18950, lmeChange: -0.5, shfeChange: -0.3 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetals(prevMetals => 
        prevMetals.map(metal => ({
          ...metal,
          lmePrice: metal.lmePrice * (1 + (Math.random() - 0.5) * 0.003),
          shfePrice: metal.shfePrice * (1 + (Math.random() - 0.5) * 0.003),
          lmeChange: metal.lmeChange + (Math.random() - 0.5) * 0.2,
          shfeChange: metal.shfeChange + (Math.random() - 0.5) * 0.2,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-lg p-4 animate-fade-in">
      <h3 className="text-base font-semibold mb-4 border-b pb-2">Copper & Aluminum</h3>
      <div className="space-y-4">
        {metals.map((metal) => (
          <div key={metal.symbol} className="space-y-2">
            <p className="font-medium text-sm">{metal.symbol} - {metal.name}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">LME</p>
                <p className="font-semibold text-sm">${metal.lmePrice.toFixed(0)}</p>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${metal.lmeChange >= 0 ? "text-success" : "text-warning"}`}>
                  {metal.lmeChange >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                  {metal.lmeChange >= 0 ? '+' : ''}{metal.lmeChange.toFixed(2)}%
                </span>
              </div>
              <div className="bg-accent/30 p-2 rounded space-y-1">
                <p className="text-xs text-muted-foreground">SHFE</p>
                <p className="font-semibold text-sm">¥{metal.shfePrice.toFixed(0)}</p>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${metal.shfeChange >= 0 ? "text-success" : "text-warning"}`}>
                  {metal.shfeChange >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                  {metal.shfeChange >= 0 ? '+' : ''}{metal.shfeChange.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CopperAluminumCard;
