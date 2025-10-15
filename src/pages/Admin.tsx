import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Database, Settings, Activity, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

const Admin = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">จัดการระบบและข้อมูล</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              จัดการผู้ใช้
            </CardTitle>
            <CardDescription>ดูและจัดการบัญชีผู้ใช้</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">จำนวนผู้ใช้ทั้งหมด: -</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              SQL Editor
            </CardTitle>
            <CardDescription>เรียกใช้คำสั่ง SQL (Admin เท่านั้น)</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/sql-editor">
              <Button variant="outline" className="w-full">
                <Database className="mr-2 h-4 w-4" />
                เปิด SQL Editor
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              ฐานข้อมูล
            </CardTitle>
            <CardDescription>จัดการและตรวจสอบฐานข้อมูล</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">สถานะ: ปกติ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              กิจกรรมระบบ
            </CardTitle>
            <CardDescription>ติดตามกิจกรรมและล็อก</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">กิจกรรมล่าสุด: -</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              ตั้งค่าระบบ
            </CardTitle>
            <CardDescription>กำหนดค่าและการตั้งค่า</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">เวอร์ชัน: 1.0.0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
