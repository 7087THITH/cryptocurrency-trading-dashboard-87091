import MarketStats from "@/components/MarketStats";
import MultiBlockCharts from "@/components/MultiBlockCharts";
import MarketHistory from "@/components/MarketHistory";
import DataDisplayPanels from "@/components/DataDisplayPanels";
import USDPairsCard from "@/components/cards/USDPairsCard";
import THBPairsCard from "@/components/cards/THBPairsCard";
import MajorPairsCard from "@/components/cards/MajorPairsCard";
import CopperAluminumCard from "@/components/cards/CopperAluminumCard";
import ZincLeadCard from "@/components/cards/ZincLeadCard";
import NickelTinCard from "@/components/cards/NickelTinCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-full"
        >
          <CarouselContent>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <USDPairsCard />
            </CarouselItem>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <THBPairsCard />
            </CarouselItem>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <MajorPairsCard />
            </CarouselItem>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <CopperAluminumCard />
            </CarouselItem>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <ZincLeadCard />
            </CarouselItem>
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <NickelTinCard />
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        
        <MarketHistory />
      </div>
    </div>
  );
};

export default Index;