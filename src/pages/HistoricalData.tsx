import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftRight } from 'lucide-react';
const HistoricalData = () => {
  // Load saved values from localStorage or use defaults
  const [amount, setAmount] = useState<string>(() => {
    const saved = localStorage.getItem('historical-amount');
    return saved || '1';
  });
  const [fromCurrency, setFromCurrency] = useState<string>(() => {
    const saved = localStorage.getItem('historical-fromCurrency');
    return saved || 'USD';
  });
  const [toCurrency, setToCurrency] = useState<string>(() => {
    const saved = localStorage.getItem('historical-toCurrency');
    return saved || 'THB';
  });
  const exchangeRates: Record<string, Record<string, number>> = {
    USD: {
      THB: 36.85,
      JPY: 149.50,
      CNY: 7.24,
      EUR: 0.92,
      GBP: 0.79
    },
    THB: {
      USD: 0.027,
      JPY: 4.18,
      CNY: 0.267,
      EUR: 0.025,
      GBP: 0.021
    },
    JPY: {
      USD: 0.0067,
      THB: 0.24,
      CNY: 0.048,
      EUR: 0.0062,
      GBP: 0.0053
    },
    CNY: {
      USD: 0.138,
      THB: 3.75,
      JPY: 20.65,
      EUR: 0.127,
      GBP: 0.109
    },
    EUR: {
      USD: 1.09,
      THB: 40.15,
      JPY: 162.50,
      CNY: 7.88,
      GBP: 0.86
    },
    GBP: {
      USD: 1.27,
      THB: 46.75,
      JPY: 189.20,
      CNY: 9.18,
      EUR: 1.16
    }
  };
  const currencies = ['USD', 'THB', 'JPY', 'CNY', 'EUR', 'GBP'];
  const convertedAmount = amount && !isNaN(parseFloat(amount)) ? (parseFloat(amount) * (exchangeRates[fromCurrency]?.[toCurrency] || 1)).toFixed(2) : '0.00';
  const swapCurrencies = () => {
    const newFrom = toCurrency;
    const newTo = fromCurrency;
    setFromCurrency(newFrom);
    setToCurrency(newTo);
    localStorage.setItem('historical-fromCurrency', newFrom);
    localStorage.setItem('historical-toCurrency', newTo);
  };
  const handleAmountChange = (value: string) => {
    setAmount(value);
    localStorage.setItem('historical-amount', value);
  };
  const handleFromCurrencyChange = (value: string) => {
    setFromCurrency(value);
    localStorage.setItem('historical-fromCurrency', value);
  };
  const handleToCurrencyChange = (value: string) => {
    setToCurrency(value);
    localStorage.setItem('historical-toCurrency', value);
  };
  return <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tool</h1>
        <p className="text-muted-foreground">Converter tool</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>แปลงสกุลเงิน</CardTitle>
          <CardDescription>เลือกสกุลเงินและจำนวนที่ต้องการแปลง</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">จำนวนเงิน</Label>
              <Input id="amount" type="number" value={amount} onChange={e => handleAmountChange(e.target.value)} placeholder="กรอกจำนวนเงิน" min="0" step="0.01" />
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="from-currency">จาก</Label>
                <Select value={fromCurrency} onValueChange={handleFromCurrencyChange}>
                  <SelectTrigger id="from-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <button onClick={swapCurrencies} className="mb-2 p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Swap currencies">
                <ArrowLeftRight className="h-5 w-5" />
              </button>

              <div className="space-y-2">
                <Label htmlFor="to-currency">เป็น</Label>
                <Select value={toCurrency} onValueChange={handleToCurrencyChange}>
                  <SelectTrigger id="to-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">ผลลัพธ์</p>
                <p className="text-4xl font-bold text-primary">
                  {convertedAmount} {toCurrency}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  อัตราแลกเปลี่ยน: 1 {fromCurrency} = {exchangeRates[fromCurrency]?.[toCurrency] || 0} {toCurrency}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default HistoricalData;