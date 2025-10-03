import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MetalData {
  symbol: string;
  name: string;
  lmePrice: number;
  shfePrice: number;
  lmeChange: number;
  shfeChange: number;
  lmeHigh: number;
  lmeLow: number;
  shfeHigh: number;
  shfeLow: number;
}

const MetalsTable = () => {
  const [metals, setMetals] = useState<MetalData[]>([
    { 
      symbol: "CU", 
      name: "Copper",
      lmePrice: 8245,
      shfePrice: 68420,
      lmeChange: 1.2,
      shfeChange: 0.8,
      lmeHigh: 8350,
      lmeLow: 8180,
      shfeHigh: 69200,
      shfeLow: 67800
    },
    { 
      symbol: "AL", 
      name: "Aluminum",
      lmePrice: 2156,
      shfePrice: 18950,
      lmeChange: -0.5,
      shfeChange: -0.3,
      lmeHigh: 2185,
      lmeLow: 2145,
      shfeHigh: 19150,
      shfeLow: 18820
    },
    { 
      symbol: "ZN", 
      name: "Zinc",
      lmePrice: 2589,
      shfePrice: 21650,
      lmeChange: 0.7,
      shfeChange: 1.1,
      lmeHigh: 2620,
      lmeLow: 2565,
      shfeHigh: 21950,
      shfeLow: 21450
    },
    { 
      symbol: "PB", 
      name: "Lead",
      lmePrice: 2045,
      shfePrice: 16780,
      lmeChange: -0.3,
      shfeChange: 0.4,
      lmeHigh: 2068,
      lmeLow: 2032,
      shfeHigh: 16920,
      shfeLow: 16650
    },
    { 
      symbol: "NI", 
      name: "Nickel",
      lmePrice: 16850,
      shfePrice: 128450,
      lmeChange: 1.8,
      shfeChange: 1.5,
      lmeHigh: 17120,
      lmeLow: 16680,
      shfeHigh: 130200,
      shfeLow: 127300
    },
    { 
      symbol: "SN", 
      name: "Tin",
      lmePrice: 25680,
      shfePrice: 213500,
      lmeChange: 0.9,
      shfeChange: 1.2,
      lmeHigh: 26100,
      lmeLow: 25420,
      shfeHigh: 216800,
      shfeLow: 211400
    },
  ]);

  const { toast } = useToast();

  // Fetch real LME prices from scraping edge function
  const fetchLMEPrices = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-lme-prices');
      
      if (error) throw error;
      
      if (data?.success && data?.data) {
        console.log('LME prices fetched:', data.data);
        
        // Update metals with real prices
        setMetals(prevMetals => 
          prevMetals.map(metal => {
            const lmeData = data.data.find((d: any) => d.symbol === metal.symbol);
            if (lmeData) {
              return {
                ...metal,
                lmePrice: lmeData.price,
                lmeChange: lmeData.change,
              };
            }
            return metal;
          })
        );
      }
    } catch (error) {
      console.error('Error fetching LME prices:', error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลราคา LME ได้",
        variant: "destructive",
      });
    }
  };

  // Fetch LME prices on mount and every 30 seconds
  useEffect(() => {
    fetchLMEPrices();
    const interval = setInterval(fetchLMEPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Simulate SHFE price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetals(prevMetals => 
        prevMetals.map(metal => {
          const newShfePrice = metal.shfePrice * (1 + (Math.random() - 0.5) * 0.003);
          return {
            ...metal,
            shfePrice: newShfePrice,
            shfeChange: metal.shfeChange + (Math.random() - 0.5) * 0.2,
            shfeHigh: Math.max(metal.shfeHigh, newShfePrice),
            shfeLow: Math.min(metal.shfeLow, newShfePrice),
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-lg p-4 animate-fade-in">
      <h2 className="text-lg font-semibold mb-3">Metal Markets</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-2">Metal</th>
              <th className="pb-2 text-center" colSpan={3}>
                <div className="flex justify-around items-center">
                  <span className="flex-1 text-center">LME (USD)</span>
                </div>
              </th>
              <th className="pb-2 text-center" colSpan={3}>
                <div className="flex justify-around items-center bg-pink-100 dark:bg-pink-900/20 px-2 py-1 rounded">
                  <span className="flex-1 text-center">SHFE (CNY)</span>
                </div>
              </th>
            </tr>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-2"></th>
              <th className="pb-2 text-center">Price</th>
              <th className="pb-2 text-center">Change</th>
              <th className="pb-2 text-center">H/L</th>
              <th className="pb-2 text-center bg-pink-50 dark:bg-pink-900/10">Price</th>
              <th className="pb-2 text-center bg-pink-50 dark:bg-pink-900/10">Change</th>
              <th className="pb-2 text-center bg-pink-50 dark:bg-pink-900/10">H/L</th>
            </tr>
          </thead>
          <tbody>
            {metals.map((metal) => (
              <tr key={metal.symbol} className="border-t border-secondary">
                <td className="py-2">
                  <div>
                    <p className="font-bold">{metal.symbol}</p>
                    <p className="text-xs text-muted-foreground">{metal.name}</p>
                  </div>
                </td>
                <td className="py-2 text-center">
                  <p className="font-medium">${metal.lmePrice.toFixed(0)}</p>
                </td>
                <td className="py-2 text-center">
                  <span
                    className={`flex items-center justify-center gap-1 ${
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
                </td>
                <td className="py-2 text-center">
                  <div className="text-xs text-muted-foreground">
                    <div>${metal.lmeHigh.toFixed(0)}</div>
                    <div>${metal.lmeLow.toFixed(0)}</div>
                  </div>
                </td>
                <td className="py-2 text-center bg-pink-50 dark:bg-pink-900/10">
                  <p className="font-medium">¥{metal.shfePrice.toFixed(0)}</p>
                </td>
                <td className="py-2 text-center bg-pink-50 dark:bg-pink-900/10">
                  <span
                    className={`flex items-center justify-center gap-1 ${
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
                </td>
                <td className="py-2 text-center bg-pink-50 dark:bg-pink-900/10">
                  <div className="text-xs text-muted-foreground">
                    <div>¥{metal.shfeHigh.toFixed(0)}</div>
                    <div>¥{metal.shfeLow.toFixed(0)}</div>
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
