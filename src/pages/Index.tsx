import MarketStats from "@/components/MarketStats";
import TradingChart from "@/components/TradingChart";
import PortfolioCard from "@/components/PortfolioCard";
import CurrencyPairs from "@/components/CurrencyPairs";
import MetalsTable from "@/components/MetalsTable";
import MarketHistory from "@/components/MarketHistory";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trading Dashboard</h1>
          <p className="text-muted-foreground">Currency Pairs & Metal Markets</p>
        </header>
        
        <MarketStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TradingChart />
          </div>
          <div>
            <PortfolioCard />
          </div>
        </div>
        
        <CurrencyPairs />
        <MetalsTable />
        <MarketHistory />
      </div>
    </div>
  );
};

export default Index;