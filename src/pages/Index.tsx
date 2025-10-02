import MarketStats from "@/components/MarketStats";
import TradingChart from "@/components/TradingChart";
import PortfolioCard from "@/components/PortfolioCard";
import CurrencyPairs from "@/components/CurrencyPairs";
import MetalsTable from "@/components/MetalsTable";
import MarketHistory from "@/components/MarketHistory";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold mb-1">Trading Dashboard</h1>
          <p className="text-muted-foreground">Currency Pairs & Metal Markets</p>
        </header>
        
        <MarketStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <TradingChart />
          </div>
          <div>
            <PortfolioCard />
          </div>
        </div>
        
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