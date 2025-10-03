import MarketStats from "@/components/MarketStats";
import MultiBlockCharts from "@/components/MultiBlockCharts";
import MarketHistory from "@/components/MarketHistory";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TranslatedText from "@/components/TranslatedText";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full p-4 space-y-4">
        <header className="mb-4 flex justify-between items-start">
          <div>
            <TranslatedText text="Trading Dashboard" as="h1" className="text-3xl font-bold mb-1" />
            <TranslatedText text="Currency Pairs & Metal Markets" as="p" className="text-muted-foreground" />
          </div>
          <LanguageSwitcher />
        </header>
        
        <MarketStats />
        
        <MultiBlockCharts />
        
        <MarketHistory />
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;