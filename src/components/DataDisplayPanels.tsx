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
  return (
    <div className="w-full space-y-4 animate-fade-in">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Data Display Panels</h2>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="trend">Trend</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {dataCategories.map(category => (
                <MonthlyChart
                  key={category.id}
                  symbol={category.symbol}
                  market={category.market}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="yearly" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {dataCategories.map(category => (
                <YearlyChart
                  key={category.id}
                  symbol={category.symbol}
                  market={category.market}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trend" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {dataCategories.map(category => (
                <TrendChart
                  key={category.id}
                  symbol={category.symbol}
                  market={category.market}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
export default DataDisplayPanels;