import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';

export const ExcelImporter = () => {
  const [loading, setLoading] = useState(false);

  const parseExcelData = (worksheet: XLSX.WorkSheet) => {
    const rows: any[] = [];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
      const makingDateCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 0 })];
      const dataDateCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 1 })];
      const currencyCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 2 })];
      const sellingPriceCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 3 })];
      const exchangeRateCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 4 })];
      const metalCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 6 })];
      const lmeUsdCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 7 })];
      const shfeCnyCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 8 })];
      const shfeUsdCell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 10 })];

      if (!makingDateCell?.v || !dataDateCell?.v) continue;

      const row: any = {
        makingDate: new Date(makingDateCell.v).toISOString().split('T')[0],
        dataDate: new Date(dataDateCell.v).toISOString().split('T')[0],
      };

      if (currencyCell?.v) row.currency = String(currencyCell.v);
      if (sellingPriceCell?.v) row.sellingPrice = Number(sellingPriceCell.v);
      if (exchangeRateCell?.v) row.exchangeRate = Number(exchangeRateCell.v);
      if (metalCell?.v) row.metal = String(metalCell.v);
      if (lmeUsdCell?.v) row.lmeUsd = Number(String(lmeUsdCell.v).replace(/,/g, ''));
      if (shfeCnyCell?.v) row.shfeCny = Number(String(shfeCnyCell.v).replace(/,/g, ''));
      if (shfeUsdCell?.v) row.shfeUsd = Number(String(shfeUsdCell.v).replace(/,/g, ''));

      rows.push(row);
    }

    return rows;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = parseExcelData(worksheet);

      console.log('Parsed data:', parsedData.length, 'rows');

      const { data: result, error } = await supabase.functions.invoke('import-excel-data', {
        body: { data: parsedData }
      });

      if (error) throw error;

      toast.success(`นำเข้าข้อมูลสำเร็จ: ${result.counts.exchangeRates} อัตราแลกเปลี่ยน, ${result.counts.lmePrices} LME, ${result.counts.shfePrices} SHFE`);
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('เกิดข้อผิดพลาดในการนำเข้าข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">นำเข้าข้อมูลจาก Excel</h3>
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          disabled={loading}
          className="hidden"
          id="excel-upload"
        />
        <Button 
          disabled={loading} 
          onClick={() => document.getElementById('excel-upload')?.click()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังนำเข้า...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              เลือกไฟล์ Excel
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
