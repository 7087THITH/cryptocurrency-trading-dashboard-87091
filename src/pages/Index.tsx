import MarketStats from "@/components/MarketStats";
import TradingChart from "@/components/TradingChart";
import CurrencyPairs from "@/components/CurrencyPairs";
import MetalsTable from "@/components/MetalsTable";
import MarketHistory from "@/components/MarketHistory";
import DataDisplayPanels from "@/components/DataDisplayPanels";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold mb-1">Trading Dashboard</h1>
          <p className="text-muted-foreground">Currency Pairs & Metal Markets</p>
        </header>
        
        <MarketStats />
        
        <div className="grid grid-cols-1 gap-4">
          <TradingChart />
        </div>
        
        <DataDisplayPanels />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CurrencyPairs />
          <MetalsTable />
        </div>
        
        <MarketHistory />
      </div>
    </div>
  );
};

export default Index;