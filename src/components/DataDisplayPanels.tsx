import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthlyChart from "./charts/MonthlyChart";
import YearlyChart from "./charts/YearlyChart";
import TrendChart from "./charts/TrendChart";
import { format, subDays, subMonths } from "date-fns";
const dataCategories = [{
  id: "usd-thb",
  label: "USD/THB",
  symbol: "USD/THB",
  market: "FX"
}, {
  id: "thb-jpy",
  label: "THB/JPY",
  symbol: "THB/JPY",
  market: "FX"
}, {
  id: "thb-cny",
  label: "THB/CNY",
  symbol: "THB/CNY",
  market: "FX"
}, {
  id: "usd-cny",
  label: "USD/CNY",
  symbol: "USD/CNY",
  market: "FX"
}, {
  id: "lme",
  label: "LME",
  symbol: "LME",
  market: "METALS"
}, {
  id: "shfe",
  label: "SHFE",
  symbol: "SHFE",
  market: "METALS"
}];
const DataDisplayPanels = () => {
  const [activeTab, setActiveTab] = useState("monthly");
  const dateRanges = useMemo(() => {
    const today = new Date();
    return {
      monthly: {
        start: format(subDays(today, 30), "d MMM''yy"),
        mid: format(subDays(today, 15), "d MMM''yy"),
        end: format(today, "d MMM''yy")
      },
      yearly: {
        start: format(subMonths(today, 12), "MMM yyyy"),
        mid: format(subMonths(today, 6), "MMM yyyy"),
        end: format(today, "MMM yyyy")
      },
      trend: {
        start: "2019",
        mid: "2021",
        end: "2023"
      }
    };
  }, []);
  return;
};
export default DataDisplayPanels;