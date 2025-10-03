import RealtimeChart from '@/components/charts/RealtimeChart';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import TranslatedText from '@/components/TranslatedText';

const LiveTV3 = () => {
  const charts = [
    { symbol: 'USD/THB', market: 'FX', title: 'USD/THB' },
    { symbol: 'THB/JPY', market: 'FX', title: 'THB/JPY' },
    { symbol: 'THB/CNY', market: 'FX', title: 'THB/CNY' },
    { symbol: 'USD/CNY', market: 'FX', title: 'USD/CNY' },
    { symbol: 'COPPER', market: 'METALS', title: 'LME COPPER' },
    { symbol: 'ALUMINIUM', market: 'METALS', title: 'LME ALUMINIUM' },
    { symbol: 'COPPER', market: 'SHFE', title: 'SHFE COPPER' },
    { symbol: 'ALUMINIUM', market: 'SHFE', title: 'SHFE ALUMINIUM' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <TranslatedText text="Live TV 3 - Real-time Charts" as="h1" className="text-3xl font-bold" />
          <TranslatedText text="Real-time data charts" as="p" className="text-muted-foreground mt-2" />
        </div>
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {charts.map((chart, index) => (
          <RealtimeChart
            key={`${chart.symbol}-${chart.market}-${index}`}
            symbol={chart.symbol}
            market={chart.market}
            title={chart.title}
          />
        ))}
      </div>
      
      <Footer />
    </div>
  );
};

export default LiveTV3;
