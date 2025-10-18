import TradingViewChart from '@/components/TradingViewChart';
import Footer from '@/components/Footer';
const LiveTV = () => {
  const tradingViewCharts = [{
    symbol: 'FX_IDC:USDTHB',
    title: 'USD/THB'
  }, {
    symbol: 'FX_IDC:THBJPY',
    title: 'THB/JPY'
  }, {
    symbol: 'FX_IDC:THBCNY',
    title: 'THB/CNY'
  }, {
    symbol: 'FX_IDC:USDCNY',
    title: 'USD/CNY'
  }, {
    symbol: 'SHFE:CU1!',
    title: 'SHFE COPPER (CU)'
  }, {
    symbol: 'SHFE:AL1!',
    title: 'SHFE ALUMINIUM (AL)'
  }, {
    symbol: 'SHFE:ZN1!',
    title: 'SHFE ZINC (ZN)'
  }, {
    symbol: 'COMEX:HG1!',
    title: 'LME COPPER (CU)'
  }, {
    symbol: 'LME:AH1!',
    title: 'LME ALUMINIUM (AL)'
  }, {
    symbol: 'LME:ZS1!',
    title: 'LME ZINC (ZN)'
  }];
  return <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">EXCHANGE - RATE</h1>
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {tradingViewCharts.map((chart, index) => <div key={`${chart.symbol}-${index}`} className="glass-card p-6 rounded-lg animate-fade-in flex flex-col" style={{
        minHeight: '500px'
      }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-slate-700 font-bold">{chart.title}</h2>
            </div>
            <div className="flex-1 w-full">
              <TradingViewChart symbol={chart.symbol} title={chart.title} interval="D" theme="light" locale="en" allowSymbolChange={false} />
            </div>
          </div>)}
      </div>
      
      <Footer />
    </div>;
};
export default LiveTV;