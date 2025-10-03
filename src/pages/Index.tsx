import MarketStats from "@/components/MarketStats";
import TradingChart from "@/components/TradingChart";
import MarketHistory from "@/components/MarketHistory";
import DataDisplayPanels from "@/components/DataDisplayPanels";
import USDPairsCard from "@/components/cards/USDPairsCard";
import THBPairsCard from "@/components/cards/THBPairsCard";
import MajorPairsCard from "@/components/cards/MajorPairsCard";
import CopperAluminumCard from "@/components/cards/CopperAluminumCard";
import ZincLeadCard from "@/components/cards/ZincLeadCard";
import NickelTinCard from "@/components/cards/NickelTinCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 space-y-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold mb-1">Trading Dashboard</h1>
          <p className="text-muted-foreground">Currency Pairs & Metal Markets</p>
        </header>
        
        <MarketStats />
        
        <div className="grid grid-cols-1 gap-4">
          <TradingChart />
        </div>
        
        <DataDisplayPanels />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <USDPairsCard />
          <THBPairsCard />
          <MajorPairsCard />
          <CopperAluminumCard />
          <ZincLeadCard />
          <NickelTinCard />
        </div>
        
        <MarketHistory />
      </div>
    </div>
  );
};

export default Index;