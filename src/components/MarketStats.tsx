import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";

const MarketStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">USD/CNY</h3>
          <TrendingUpIcon className="w-4 h-4 text-warning" />
        </div>
        <p className="text-2xl font-semibold mt-2">7.24</p>
        <span className="text-sm text-warning flex items-center gap-1">
          <ArrowDownIcon className="w-3 h-3" />
          0.08%
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">LME Copper</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-2xl font-semibold mt-2">$8,245</p>
        <span className="text-sm text-success flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          1.2%
        </span>
      </div>
      
      <div className="glass-card p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">SHFE Aluminum</h3>
          <TrendingUpIcon className="w-4 h-4 text-warning" />
        </div>
        <p className="text-2xl font-semibold mt-2">¥18,950</p>
        <span className="text-sm text-warning flex items-center gap-1">
          <ArrowDownIcon className="w-3 h-3" />
          0.3%
        </span>
      </div>
    </div>
  );
};

export default MarketStats;