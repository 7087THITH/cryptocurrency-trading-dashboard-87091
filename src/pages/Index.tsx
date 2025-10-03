import MarketStats from "@/components/MarketStats";
import MultiBlockCharts from "@/components/MultiBlockCharts";
import MarketHistory from "@/components/MarketHistory";
import DataDisplayPanels from "@/components/DataDisplayPanels";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 space-y-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold mb-1">Trading Dashboard</h1>
          <p className="text-muted-foreground">Currency Pairs & Metal Markets</p>
        </header>
        
        <MarketStats />
        
        <MultiBlockCharts />
        
        <DataDisplayPanels />
        
        <MarketHistory />
      </div>
    </div>
  );
};

export default Index;