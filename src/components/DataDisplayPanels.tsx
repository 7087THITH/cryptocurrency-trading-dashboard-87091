import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthlyChart from "./charts/MonthlyChart";
import YearlyChart from "./charts/YearlyChart";
import TrendChart from "./charts/TrendChart";

const dataCategories = [
  { id: "usd-thb", label: "USD/THB", symbol: "USD/THB", market: "FX" },
  { id: "thb-jpy", label: "THB/JPY", symbol: "THB/JPY", market: "FX" },
  { id: "thb-cny", label: "THB/CNY", symbol: "THB/CNY", market: "FX" },
  { id: "usd-cny", label: "USD/CNY", symbol: "USD/CNY", market: "FX" },
  { id: "lme", label: "LME", symbol: "LME", market: "METALS" },
  { id: "shfe", label: "SHFE", symbol: "SHFE", market: "METALS" },
];

const DataDisplayPanels = () => {
  return (
    <Card className="glass-card mb-8 w-full">
      <CardContent className="pt-6">
        <Tabs defaultValue="usd-thb" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
            {dataCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {dataCategories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <Tabs defaultValue="monthly" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
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
