import RealtimeChart from '@/components/charts/RealtimeChart';

const LiveTV = () => {
  const charts = [
    { symbol: 'USD/THB', market: 'FX', title: 'USD/THB' },
    { symbol: 'THB/JPY', market: 'FX', title: 'THB/JPY' },
    { symbol: 'THB/CNY', market: 'FX', title: 'THB/CNY' },
    { symbol: 'USD/CNY', market: 'FX', title: 'USD/CNY' },
    { symbol: 'CU', market: 'SHFE', title: 'SHFE COPPER (CU)' },
    { symbol: 'AL', market: 'SHFE', title: 'SHFE ALUMINIUM (AL)' },
    { symbol: 'ZN', market: 'SHFE', title: 'SHFE ZINC (ZN)' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Live TV - Real-time Charts</h1>
        <p className="text-muted-foreground mt-2">กราฟแสดงข้อมูลแบบเรียลไทม์</p>
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
    </div>
  );
};

export default LiveTV;
