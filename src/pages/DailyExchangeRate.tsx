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
  const currencyPairs = [{
    id: "USD/THB",
    label: "THB / USD (TTS)"
  }, {
    id: "THB/JPY",
    label: "JPY / THB (TTS)"
  }, {
    id: "USD/CNY",
    label: "RMB / USD"
  }, {
    id: "CNY/THB",
    label: "RMB / THB"
  }];
  const {
    data: exchangeData,
    isLoading
  } = useQuery({
    queryKey: ["daily-exchange-rates", selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);
      const {
        data,
        error
      } = await supabase.from("historical_exchange_rates").select("*").gte("data_date", startDate.toISOString().split("T")[0]).lte("data_date", endDate.toISOString().split("T")[0]).order("data_date", {
        ascending: true
      });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000
  });
  const months = [{
    value: 1,
    label: "มกราคม"
  }, {
    value: 2,
    label: "กุมภาพันธ์"
  }, {
    value: 3,
    label: "มีนาคม"
  }, {
    value: 4,
    label: "เมษายน"
  }, {
    value: 5,
    label: "พฤษภาคม"
  }, {
    value: 6,
    label: "มิถุนายน"
  }, {
    value: 7,
    label: "กรกฎาคม"
  }, {
    value: 8,
    label: "สิงหาคม"
  }, {
    value: 9,
    label: "กันยายน"
  }, {
    value: 10,
    label: "ตุลาคม"
  }, {
    value: 11,
    label: "พฤศจิกายน"
  }, {
    value: 12,
    label: "ธันวาคม"
  }];
  const years = Array.from({
    length: 10
  }, (_, i) => currentDate.getFullYear() - i);

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
    ...currencies
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
  return;
};
export default DailyExchangeRate;