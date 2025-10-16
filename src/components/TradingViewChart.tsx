import React, { useEffect, useMemo, useRef, useState } from "react";

// Lightweight wrapper for TradingView Advanced Real-Time Chart
// Loads tv.js once and creates a widget per instance
// Usage: <TradingViewChart symbol="SHFE:CU1!" title="SHFE COPPER (CU)" />

declare global {
  interface Window {
    TradingView?: any;
  }
}
interface TradingViewChartProps {
  symbol: string;
  title?: string;
  interval?: "1" | "3" | "5" | "15" | "30" | "60" | "120" | "240" | "D" | "W" | "M";
  locale?: string;
  theme?: "light" | "dark";
  allowSymbolChange?: boolean;
}
const TV_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";
let tvScriptLoadingPromise: Promise<void> | null = null;
function loadTradingViewScript(): Promise<void> {
  if (window.TradingView) return Promise.resolve();
  if (tvScriptLoadingPromise) return tvScriptLoadingPromise;
  tvScriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "tradingview-widget-script";
    script.src = TV_SCRIPT_SRC;
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load TradingView script"));
    document.head.appendChild(script);
  });
  return tvScriptLoadingPromise;
}
export default function TradingViewChart({
  symbol,
  title,
  interval = "D",
  locale = "en",
  theme = "light",
  allowSymbolChange = false
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const containerId = useMemo(() => `tv_${symbol.replace(/[^a-zA-Z0-9]/g, "_")}_${Math.random().toString(36).slice(2, 7)}`, [symbol]);
  useEffect(() => {
    let cancelled = false;
    loadTradingViewScript().then(() => {
      if (cancelled) return;
      if (!window.TradingView || !containerRef.current) return;

      // Ensure target container exists and is clean
      const target = document.getElementById(containerId);
      if (!target) return;
      target.innerHTML = "";
      const widget = new window.TradingView.widget({
        autosize: true,
        symbol,
        interval,
        timezone: "Etc/UTC",
        theme: theme === "dark" ? "dark" : "light",
        style: "1",
        locale,
        toolbar_bg: "#FAFAF8",
        enable_publishing: false,
        hide_side_toolbar: true,
        allow_symbol_change: allowSymbolChange,
        container_id: containerId,
        // Reduce features to match our clean UI
        disabled_features: ["header_indicators", "header_compare", "header_screenshot", "header_undo_redo"],
        enabled_features: ["hide_left_toolbar_by_default"]
      });
      setReady(true);
      return widget;
    }).catch(e => {
      console.error("TradingView load error:", e);
      setReady(false);
    });
    return () => {
      cancelled = true;
      const target = document.getElementById(containerId);
      if (target) target.innerHTML = "";
    };
  }, [symbol, interval, locale, theme, allowSymbolChange, containerId]);
  return <div className="glass-card p-6 rounded-lg animate-fade-in flex flex-col" style={{
    minHeight: 500
  }}>
      {title ? <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-left">{title}</h2>
        </div> : null}
      <div className="flex-1 w-full" ref={containerRef}>
        <div id={containerId} style={{
        width: "100%",
        height: 420
      }} />
        {!ready && <div className="w-full h-[420px] flex items-center justify-center text-muted-foreground">
            Loading chart...
          </div>}
      </div>
    </div>;
}