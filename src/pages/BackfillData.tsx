import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Database, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BackfillData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoricalLoading, setIsHistoricalLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [historicalResult, setHistoricalResult] = useState<any>(null);
  const [hasData, setHasData] = useState<boolean | null>(null);

  // ตรวจสอบว่ามีข้อมูลในตารางหรือไม่
  useEffect(() => {
    const checkData = async () => {
      const { count } = await supabase
        .from('market_prices')
        .select('*', { count: 'exact', head: true });
      
      setHasData(count !== null && count > 0);
    };
    
    checkData();
  }, [result, historicalResult]);

  const handleBackfill = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      toast.info('กำลังเริ่มดึงข้อมูล 60 วันย้อนหลัง...');
      
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

  const handleHistoricalBackfill = async () => {
    setIsHistoricalLoading(true);
    setHistoricalResult(null);

    try {
      toast.info('กำลังดึงข้อมูลย้อนหลังตั้งแต่ปี 2021... (อาจใช้เวลา 2-3 นาที)');
      
      const { data, error } = await supabase.functions.invoke('fetch-historical-data');

      if (error) throw error;

      setHistoricalResult(data);
      toast.success(`สำเร็จ! บันทึก ${data.totalRecords} รายการ`);
    } catch (error) {
      console.error('Historical backfill error:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลย้อนหลัง');
    } finally {
      setIsHistoricalLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {hasData === false && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            ฐานข้อมูลของคุณยังไม่มีข้อมูล กรุณาเลือกวิธีการดึงข้อมูลด้านล่าง
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            ดึงข้อมูลย้อนหลัง 60 วัน (แนะนำ)
          </CardTitle>
          <CardDescription>
            ดึงข้อมูลราคาตลาดย้อนหลัง 60 วันสำหรับทุก Symbol และ Market
            <br />
            เหมาะสำหรับการเริ่มต้นใช้งาน - ใช้เวลาประมาณ 30-60 วินาที
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleBackfill} 
            disabled={isLoading || isHistoricalLoading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <Database className="mr-2 h-4 w-4" />}
            {isLoading ? 'กำลังดึงข้อมูล...' : 'เริ่มดึงข้อมูล 60 วัน'}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 text-green-600">✓ ดึงข้อมูลสำเร็จ</h3>
              <p>จำนวนรายการที่บันทึก: <strong>{result.totalRecordsInserted}</strong></p>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ดึงข้อมูลย้อนหลังตั้งแต่ปี 2021
          </CardTitle>
          <CardDescription>
            ดึงข้อมูลย้อนหลังทั้งหมดตั้งแต่ปี 2021 เพื่อสร้างข้อมูลสถิติรายเดือนและรายปี
            <br />
            เหมาะสำหรับการวิเคราะห์แนวโน้มระยะยาว - ใช้เวลาประมาณ 2-3 นาที
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleHistoricalBackfill} 
            disabled={isLoading || isHistoricalLoading}
            size="lg"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            {isHistoricalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isHistoricalLoading && <TrendingUp className="mr-2 h-4 w-4" />}
            {isHistoricalLoading ? 'กำลังดึงข้อมูล...' : 'เริ่มดึงข้อมูลตั้งแต่ 2021'}
          </Button>

          {historicalResult && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2 text-green-600">✓ ดึงข้อมูลสำเร็จ</h3>
              <p>จำนวนรายการที่บันทึก: <strong>{historicalResult.totalRecords}</strong></p>
              {historicalResult.message && (
                <p className="text-sm text-muted-foreground mt-1">{historicalResult.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-base">💡 คำแนะนำ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>ครั้งแรก:</strong> ให้กดปุ่ม "ดึงข้อมูล 60 วัน" เพื่อเริ่มต้นใช้งาน</p>
          <p>• <strong>ต้องการข้อมูลย้อนหลังมากขึ้น:</strong> กดปุ่ม "ดึงข้อมูลตั้งแต่ 2021"</p>
          <p>• ข้อมูลจะถูกอัพเดทอัตโนมัติทุก 15 วินาทีโดยระบบ</p>
          <p>• หากต้องการดึงข้อมูลใหม่ สามารถกดปุ่มได้ทุกเมื่อ</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackfillData;
