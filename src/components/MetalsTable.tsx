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

const MetalsTable = () => {
  const [metals, setMetals] = useState<MetalData[]>([
    { 
      symbol: "CU", 
      name: "Copper",
      lmePrice: 8245,
      shfePrice: 68420,
      lmeChange: 1.2,
      shfeChange: 0.8
    },
    { 
      symbol: "AL", 
      name: "Aluminum",
      lmePrice: 2156,
      shfePrice: 18950,
      lmeChange: -0.5,
      shfeChange: -0.3
    },
    { 
      symbol: "ZN", 
      name: "Zinc",
      lmePrice: 2589,
      shfePrice: 21650,
      lmeChange: 0.7,
      shfeChange: 1.1
    },
  ]);

  // Simulate real-time price updates
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
    <div className="glass-card rounded-lg p-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">Metal Markets</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-4">Metal</th>
              <th className="pb-4 text-center" colSpan={2}>
                <div className="flex justify-around">
                  <span className="flex-1 text-center">LME</span>
                  <span className="flex-1 text-center bg-pink-100 dark:bg-pink-900/20 px-2 py-1 rounded">SHFE CNY</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {metals.map((metal) => (
              <tr key={metal.symbol} className="border-t border-secondary">
                <td className="py-4">
                  <div>
                    <p className="font-bold text-lg">{metal.symbol}</p>
                    <p className="text-sm text-muted-foreground">{metal.name}</p>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <div className="flex flex-col items-center">
                    <p className="font-medium">${metal.lmePrice.toFixed(0)}</p>
                    <span
                      className={`flex items-center gap-1 text-sm ${
                        metal.lmeChange >= 0 ? "text-success" : "text-warning"
                      }`}
                    >
                      {metal.lmeChange >= 0 ? (
                        <ArrowUpIcon className="w-3 h-3" />
                      ) : (
                        <ArrowDownIcon className="w-3 h-3" />
                      )}
                      {Math.abs(metal.lmeChange).toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="py-4 text-center bg-pink-50 dark:bg-pink-900/10">
                  <div className="flex flex-col items-center">
                    <p className="font-medium">¥{metal.shfePrice.toFixed(0)}</p>
                    <span
                      className={`flex items-center gap-1 text-sm ${
                        metal.shfeChange >= 0 ? "text-success" : "text-warning"
                      }`}
                    >
                      {metal.shfeChange >= 0 ? (
                        <ArrowUpIcon className="w-3 h-3" />
                      ) : (
                        <ArrowDownIcon className="w-3 h-3" />
                      )}
                      {Math.abs(metal.shfeChange).toFixed(2)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MetalsTable;
