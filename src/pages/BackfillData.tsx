import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const BackfillData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleBackfill = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('backfill-market-data');

      if (error) throw error;

      setResult(data);
      toast.success(`สำเร็จ! บันทึก ${data.totalRecordsInserted} รายการ`);
    } catch (error) {
      console.error('Backfill error:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>ดึงข้อมูลย้อนหลัง</CardTitle>
          <CardDescription>
            ดึงข้อมูลราคาตลาดย้อนหลัง 60 วันสำหรับทุก Symbol และ Market
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleBackfill} 
            disabled={isLoading}
            size="lg"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'กำลังดึงข้อมูล...' : 'เริ่มดึงข้อมูลย้อนหลัง'}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">ผลลัพธ์</h3>
              <p>จำนวนรายการที่บันทึก: {result.totalRecordsInserted}</p>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-destructive font-semibold">ข้อผิดพลาด:</p>
                  <ul className="list-disc list-inside text-sm">
                    {result.errors.map((err: string, idx: number) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackfillData;
