import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

const DailyExchangeRate = () => {
  const exchangeRates = [
    { pair: "USD/THB", rate: "34.25", change: "+0.15", changePercent: "+0.44%", trend: "up" },
    { pair: "EUR/THB", rate: "37.80", change: "+0.25", changePercent: "+0.67%", trend: "up" },
    { pair: "JPY/THB", rate: "0.23", change: "-0.01", changePercent: "-4.17%", trend: "down" },
    { pair: "CNY/THB", rate: "4.75", change: "+0.05", changePercent: "+1.06%", trend: "up" },
    { pair: "GBP/THB", rate: "43.50", change: "-0.10", changePercent: "-0.23%", trend: "down" },
    { pair: "AUD/THB", rate: "22.15", change: "+0.08", changePercent: "+0.36%", trend: "up" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Daily Exchange Rate</h1>
          </div>
          <p className="text-muted-foreground">อัตราแลกเปลี่ยนรายวัน อัพเดตล่าสุด</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>อัตราแลกเปลี่ยนวันนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Currency Pair</th>
                    <th className="text-right py-3 px-4">Rate</th>
                    <th className="text-right py-3 px-4">Change</th>
                    <th className="text-right py-3 px-4">Change %</th>
                    <th className="text-center py-3 px-4">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {exchangeRates.map((rate, index) => (
                    <tr key={index} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="py-4 px-4 font-semibold">{rate.pair}</td>
                      <td className="text-right py-4 px-4 font-mono">{rate.rate}</td>
                      <td className={`text-right py-4 px-4 font-mono ${
                        rate.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {rate.change}
                      </td>
                      <td className={`text-right py-4 px-4 font-mono ${
                        rate.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {rate.changePercent}
                      </td>
                      <td className="text-center py-4 px-4">
                        {rate.trend === "up" ? (
                          <TrendingUp className="inline-block h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="inline-block h-5 w-5 text-red-600" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Highest Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">GBP/THB</p>
              <p className="text-muted-foreground">43.50</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Lowest Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">JPY/THB</p>
              <p className="text-muted-foreground">0.23</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Most Volatile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">JPY/THB</p>
              <p className="text-red-600">-4.17%</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DailyExchangeRate;
