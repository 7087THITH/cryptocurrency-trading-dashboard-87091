import { useState, useEffect } from "react";

const initialMarketData = [
  { code: "THCN", label: "THB/CNY", value: "5.14", change: 0.33, prefix: "" },
  { code: "USCN", label: "USD/CNY", value: "7.19", change: 0.2, prefix: "" },
  { code: "CN", label: "SHFE COPPER (CU)", value: "¥68,727", change: 0.81, prefix: "" },
  { code: "CN", label: "SHFE ALUMINIUM (AL)", value: "¥19,879", change: 0.56, prefix: "" },
  { code: "CN", label: "SHFE ZINC (ZN)", value: "¥21,497", change: 0.51, prefix: "" },
  { code: "GB", label: "LME COPPER (CU)", value: "$8,256", change: 1.12, prefix: "" },
  { code: "GB", label: "LME ALUMINIUM (AL)", value: "$2,528", change: 1.22, prefix: "" },
  { code: "GB", label: "LME ZINC (ZN)", value: "$2,691", change: 0.86, prefix: "" },
  { code: "TH", label: "USD/THB", value: "36.79", change: 0.06, prefix: "" },
  { code: "THJP", label: "THB/JPY", value: "4.02", change: 0.31, prefix: "" },
];

const MarketStats = () => {
  const [marketData, setMarketData] = useState(initialMarketData);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setMarketData((current) =>
        current.map((item) => {
          const cleanValue = item.value.replace(/[¥$,]/g, '');
          const numValue = parseFloat(cleanValue);
          const randomChange = (Math.random() - 0.5) * 0.1;
          
          let newValue: string;
          if (cleanValue.includes('.')) {
            newValue = (numValue + randomChange).toFixed(2);
          } else {
            newValue = Math.round(numValue + (Math.random() - 0.5) * 50).toString();
          }
          
          // Add prefix back
          const valuePrefix = item.value.match(/^[¥$]/)?.[0] || '';
          const formattedValue = valuePrefix + (cleanValue.includes('.') ? newValue : parseFloat(newValue).toLocaleString());
          
          return {
            ...item,
            value: formattedValue,
            change: parseFloat((item.change + (Math.random() - 0.5) * 0.2).toFixed(2)),
          };
        })
      );
    }, 3000);

    return () => clearInterval(updateInterval);
  }, []);

  // Duplicate items for seamless loop
  const duplicatedData = [...marketData, ...marketData];

  return (
    <div className="mb-6 animate-fade-in overflow-hidden bg-slate-900 rounded-lg">
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .scroll-container {
          animation: scroll 60s linear infinite;
        }
        .scroll-container:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="flex scroll-container">
        {duplicatedData.map((item, index) => (
          <div 
            key={`${item.label}-${index}`} 
            className="flex-shrink-0 px-6 py-3 border-r border-slate-700/50 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Country Code */}
              <div className="text-slate-400 text-xs font-semibold min-w-[40px]">
                {item.code}
              </div>
              
              {/* Market Label */}
              <div className="text-slate-300 text-sm font-medium min-w-[140px]">
                {item.label}
              </div>
              
              {/* Value */}
              <div className="text-white text-base font-bold min-w-[80px]">
                {item.value}
              </div>
              
              {/* Change Percentage */}
              <div className={`text-sm font-semibold min-w-[60px] ${
                item.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {item.change >= 0 ? '↑' : '↓'} {Math.abs(item.change).toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketStats;