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

const ZincLeadCard = () => {
  const [metals, setMetals] = useState<MetalData[]>([
    { symbol: "ZN", name: "Zinc", lmePrice: 2589, shfePrice: 21650, lmeChange: 0.7, shfeChange: 1.1 },
    { symbol: "PB", name: "Lead", lmePrice: 2045, shfePrice: 16780, lmeChange: -0.3, shfeChange: 0.4 },
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
    <div className="glass-card rounded-lg p-3 animate-fade-in">
      <h3 className="text-sm font-semibold mb-2">Zinc & Lead</h3>
      <div className="space-y-2">
        {metals.map((metal) => (
          <div key={metal.symbol} className="border-t border-secondary pt-2">
            <p className="text-xs font-bold mb-1">{metal.symbol} - {metal.name}</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <p className="text-muted-foreground mb-0.5">LME</p>
                <p className="font-medium">${metal.lmePrice.toFixed(0)}</p>
                <span className={`flex items-center gap-0.5 ${metal.lmeChange >= 0 ? "text-success" : "text-warning"}`}>
                  {metal.lmeChange >= 0 ? <ArrowUpIcon className="w-2 h-2" /> : <ArrowDownIcon className="w-2 h-2" />}
                  {Math.abs(metal.lmeChange).toFixed(2)}%
                </span>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/10 p-1.5 rounded">
                <p className="text-muted-foreground mb-0.5">SHFE</p>
                <p className="font-medium">¥{metal.shfePrice.toFixed(0)}</p>
                <span className={`flex items-center gap-0.5 ${metal.shfeChange >= 0 ? "text-success" : "text-warning"}`}>
                  {metal.shfeChange >= 0 ? <ArrowUpIcon className="w-2 h-2" /> : <ArrowDownIcon className="w-2 h-2" />}
                  {Math.abs(metal.shfeChange).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZincLeadCard;
