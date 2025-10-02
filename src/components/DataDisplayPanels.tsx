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
  const [selectedCategory, setSelectedCategory] = useState(dataCategories[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8 w-full">
      {/* Left Panel - Data Selection */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Data Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dataCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedCategory.id === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Middle Panel - Chart Type Selection */}
      <Card className="glass-card lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">{selectedCategory.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Monthly (1-30 days)</TabsTrigger>
              <TabsTrigger value="yearly">Yearly (1-12 months)</TabsTrigger>
              <TabsTrigger value="trend">Trend (2019-2023)</TabsTrigger>
            </TabsList>
            <TabsContent value="monthly" className="mt-4">
              <MonthlyChart 
                symbol={selectedCategory.symbol} 
                market={selectedCategory.market}
              />
            </TabsContent>
            <TabsContent value="yearly" className="mt-4">
              <YearlyChart 
                symbol={selectedCategory.symbol} 
                market={selectedCategory.market}
              />
            </TabsContent>
            <TabsContent value="trend" className="mt-4">
              <TrendChart 
                symbol={selectedCategory.symbol} 
                market={selectedCategory.market}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataDisplayPanels;
