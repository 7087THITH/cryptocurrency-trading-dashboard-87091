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
      
      <footer className="w-full py-6 px-4 mt-8 border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto text-center space-y-1">
          <p className="text-sm font-medium text-foreground">
            Part Procurement Division
          </p>
          <p className="text-sm text-muted-foreground">
            Daikin Industries (Thailand). All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Mr. Naito Yuhei (Manager), Mr. Thitichot Chumchuang (Dev), Ms. Orapin Khluinori
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;