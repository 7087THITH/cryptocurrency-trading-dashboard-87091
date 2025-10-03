import TradingViewWidget from 'react-tradingview-widget';

const TradingChart = () => {
  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">USD/THB Chart</h2>
      </div>
      <div className="h-[400px] w-full">
        <TradingViewWidget
          symbol="FX_IDC:USDTHB"
          theme="light"
          locale="en"
          autosize
          hide_side_toolbar={true}
          allow_symbol_change={true}
          interval="D"
          toolbar_bg="#FAFAF8"
          enable_publishing={false}
          hide_top_toolbar={false}
          save_image={false}
          container_id="tradingview_chart"
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
  );
};

export default TradingChart;
