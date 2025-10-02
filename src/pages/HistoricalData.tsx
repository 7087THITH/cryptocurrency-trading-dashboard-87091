import { ExcelImporter } from '@/components/ExcelImporter';
import { HistoricalChart } from '@/components/HistoricalChart';

const HistoricalData = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">ข้อมูลประวัติศาสตร์</h1>
        <p className="text-muted-foreground">
          ดูกราฟและแนวโน้มข้อมูลอัตราแลกเปลี่ยนและราคาโลหะย้อนหลัง
        </p>
      </div>

      <ExcelImporter />
      <HistoricalChart />
    </div>
  );
};

export default HistoricalData;
