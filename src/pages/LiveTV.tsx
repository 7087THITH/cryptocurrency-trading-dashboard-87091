import TradingViewWidget from 'react-tradingview-widget';
import ChartBlock from '@/components/charts/ChartBlock';
import Footer from '@/components/Footer';

const LiveTV = () => {
  const tradingViewCharts = [
    { symbol: 'FX_IDC:USDTHB', title: 'USD/THB' },
    { symbol: 'FX_IDC:THBJPY', title: 'THB/JPY' },
    { symbol: 'FX_IDC:THBCNY', title: 'THB/CNY' },
    { symbol: 'FX_IDC:USDCNY', title: 'USD/CNY' },
  ];

  const shfeCharts = [
    {
      title: 'SHFE COPPER (CU)',
      symbols: [{ label: 'SHFE COPPER (CU)', market: 'SHFE', symbol: 'CU' }]
    },
    {
      title: 'SHFE ALUMINIUM (AL)',
      symbols: [{ label: 'SHFE ALUMINIUM (AL)', market: 'SHFE', symbol: 'AL' }]
    },
    {
      title: 'SHFE ZINC (ZN)',
      symbols: [{ label: 'SHFE ZINC (ZN)', market: 'SHFE', symbol: 'ZN' }]
    },
  ];

  const lmeCharts = [
    {
      title: 'LME COPPER (CU)',
      symbols: [{ label: 'LME COPPER (CU)', market: 'LME', symbol: 'CU' }]
    },
    {
      title: 'LME ALUMINIUM (AL)',
      symbols: [{ label: 'LME ALUMINIUM (AL)', market: 'LME', symbol: 'AL' }]
    },
    {
      title: 'LME ZINC (ZN)',
      symbols: [{ label: 'LME ZINC (ZN)', market: 'LME', symbol: 'ZN' }]
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Live TV - Real-time Charts</h1>
        <p className="text-muted-foreground mt-2">กราฟแสดงข้อมูลแบบเรียลไทม์</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {tradingViewCharts.map((chart, index) => (
          <div 
            key={`${chart.symbol}-${index}`}
            className="glass-card p-6 rounded-lg animate-fade-in flex flex-col"
            style={{ minHeight: '500px' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{chart.title}</h2>
            </div>
            <div className="flex-1 w-full">
              <TradingViewWidget
                symbol={chart.symbol}
                theme="Light"
                locale="en"
                autosize
                hide_side_toolbar={true}
                allow_symbol_change={false}
                interval="D"
                toolbar_bg="#FAFAF8"
                enable_publishing={false}
                hide_top_toolbar={false}
                save_image={false}
                container_id={`tradingview_chart_${index}`}
                studies={[]}
                disabled_features={[
                  "header_indicators",
                  "header_compare",
                  "header_screenshot",
                  "header_undo_redo"
                ]}
                enabled_features={[
                  "hide_left_toolbar_by_default"
                ]}
              />
            </div>
          </div>
        ))}
        
        {shfeCharts.map((chart, index) => (
          <div key={`shfe-${index}`} style={{ minHeight: '500px' }}>
            <ChartBlock title={chart.title} symbols={chart.symbols} />
          </div>
        ))}
        
        {lmeCharts.map((chart, index) => (
          <div key={`lme-${index}`} style={{ minHeight: '500px' }}>
            <ChartBlock title={chart.title} symbols={chart.symbols} />
          </div>
        ))}
      </div>
      
      <Footer />
    </div>
  );
};

export default LiveTV;
