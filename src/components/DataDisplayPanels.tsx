import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthlyChart from "./charts/MonthlyChart";
import YearlyChart from "./charts/YearlyChart";
import TrendChart from "./charts/TrendChart";
import { format, subDays, subMonths } from "date-fns";

const dataCategories = [
  { id: "usd-thb", label: "USD/THB", symbol: "USD/THB", market: "FX" },
  { id: "thb-jpy", label: "THB/JPY", symbol: "THB/JPY", market: "FX" },
  { id: "thb-cny", label: "THB/CNY", symbol: "THB/CNY", market: "FX" },
  { id: "usd-cny", label: "USD/CNY", symbol: "USD/CNY", market: "FX" },
  { id: "lme", label: "LME", symbol: "LME", market: "METALS" },
  { id: "shfe", label: "SHFE", symbol: "SHFE", market: "METALS" },
];

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
    <Card className="glass-card mb-8 w-full">
      <CardContent className="pt-6">
        <Tabs defaultValue="usd-thb" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6 bg-blue-50 dark:bg-blue-950/30">
            {dataCategories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {dataCategories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <Tabs defaultValue="monthly" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="monthly">Monthly (1-30 days)</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly (1-12 months)</TabsTrigger>
                  <TabsTrigger value="trend">Trend (2019-2023)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="monthly" className="mt-4">
                  <MonthlyChart 
                    symbol={category.symbol} 
                    market={category.market}
                  />
                </TabsContent>
                <TabsContent value="yearly" className="mt-4">
                  <YearlyChart 
                    symbol={category.symbol} 
                    market={category.market}
                  />
                </TabsContent>
                <TabsContent value="trend" className="mt-4">
                  <TrendChart 
                    symbol={category.symbol} 
                    market={category.market}
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataDisplayPanels;
