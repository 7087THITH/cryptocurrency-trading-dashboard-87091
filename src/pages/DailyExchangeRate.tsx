import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import DailyExchangeChart from "@/components/charts/DailyExchangeChart";
import { Skeleton } from "@/components/ui/skeleton";

const DailyExchangeRate = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const currencyPairs = [
    { id: "USD/THB", label: "THB / USD (TTS)" },
    { id: "THB/JPY", label: "JPY / THB (TTS)" },
    { id: "USD/CNY", label: "RMB / USD" },
    { id: "CNY/THB", label: "RMB / THB" },
  ];

  const { data: exchangeData, isLoading } = useQuery({
    queryKey: ["daily-exchange-rates", selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);

      const { data, error } = await supabase
        .from("historical_exchange_rates")
        .select("*")
        .gte("data_date", startDate.toISOString().split("T")[0])
        .lte("data_date", endDate.toISOString().split("T")[0])
        .order("data_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000,
  });

  const months = [
    { value: 1, label: "มกราคม" },
    { value: 2, label: "กุมภาพันธ์" },
    { value: 3, label: "มีนาคม" },
    { value: 4, label: "เมษายน" },
    { value: 5, label: "พฤษภาคม" },
    { value: 6, label: "มิถุนายน" },
    { value: 7, label: "กรกฎาคม" },
    { value: 8, label: "สิงหาคม" },
    { value: 9, label: "กันยายน" },
    { value: 10, label: "ตุลาคม" },
    { value: 11, label: "พฤศจิกายน" },
    { value: 12, label: "ธันวาคม" },
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - i);

  // Group data by date and currency
  const groupedData = exchangeData?.reduce((acc, item) => {
    const date = new Date(item.data_date).getDate();
    if (!acc[date]) {
      acc[date] = {};
    }
    acc[date][item.currency] = parseFloat(item.exchange_rate?.toString() || "0");
    return acc;
  }, {} as Record<number, Record<string, number>>);

  const tableData = Object.entries(groupedData || {}).map(([date, currencies]) => ({
    date: parseInt(date),
    ...currencies,
  }));

  // Calculate totals and averages
  const totals = currencyPairs.reduce((acc, pair) => {
    acc[pair.id] = tableData.reduce((sum, row) => sum + (row[pair.id] || 0), 0);
    return acc;
  }, {} as Record<string, number>);

  const averages = currencyPairs.reduce((acc, pair) => {
    const count = tableData.filter(row => row[pair.id]).length;
    acc[pair.id] = count > 0 ? totals[pair.id] / count : 0;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Daily Exchange Rate</h1>
            </div>
            <div className="flex gap-4">
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-muted-foreground">อัตราแลกเปลี่ยนรายวัน อัพเดตล่าสุด</p>
        </div>

        <Tabs defaultValue="table" className="space-y-6">
          <TabsList>
            <TabsTrigger value="table">ตารางข้อมูล</TabsTrigger>
            <TabsTrigger value="charts">กราฟ</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <Card>
              <CardHeader>
                <CardTitle>อัตราแลกเปลี่ยน {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-center py-3 px-4">Date</th>
                          {currencyPairs.map((pair) => (
                            <th key={pair.id} className="text-right py-3 px-4">
                              {pair.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row) => (
                          <tr key={row.date} className="border-b hover:bg-accent/50 transition-colors">
                            <td className="text-center py-3 px-4 font-semibold">{row.date}</td>
                            {currencyPairs.map((pair) => (
                              <td key={pair.id} className="text-right py-3 px-4 font-mono">
                                {row[pair.id] ? row[pair.id].toFixed(4) : "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                        <tr className="border-t-2 font-bold bg-muted/50">
                          <td className="text-center py-3 px-4">Total</td>
                          {currencyPairs.map((pair) => (
                            <td key={pair.id} className="text-right py-3 px-4 font-mono">
                              {totals[pair.id].toFixed(2)}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-t font-bold bg-muted/30">
                          <td className="text-center py-3 px-4">Day</td>
                          <td colSpan={currencyPairs.length} className="text-center py-3 px-4">
                            {tableData.length}
                          </td>
                        </tr>
                        <tr className="border-t-2 font-bold bg-primary/10">
                          <td className="text-center py-3 px-4">Average</td>
                          {currencyPairs.map((pair) => (
                            <td key={pair.id} className="text-right py-3 px-4 font-mono">
                              {averages[pair.id].toFixed(4)}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currencyPairs.map((pair) => (
                <DailyExchangeChart
                  key={pair.id}
                  currency={pair.id}
                  month={selectedMonth}
                  year={selectedYear}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DailyExchangeRate;
