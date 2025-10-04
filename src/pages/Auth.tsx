import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { signUpSchema, signInSchema, loginRateLimiter, signupRateLimiter, sanitizeInput, emailSchema } from "@/lib/validation";
const Auth = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const validateInputs = (isSignup: boolean) => {
    try {
      if (isSignup) {
        signUpSchema.parse({
          email: email.trim(),
          password,
          full_name: fullName.trim()
        });
      } else {
        signInSchema.parse({
          email: email.trim(),
          password
        });
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "ข้อผิดพลาด",
          description: error.errors[0].message,
          variant: "destructive"
        });
      }
      return false;
    }
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!loginRateLimiter(email)) {
      toast({
        title: "พยายามเข้าสู่ระบบมากเกินไป",
        description: "กรุณารอ 15 นาทีแล้วลองใหม่อีกครั้ง",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateInputs(false)) return;
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "เข้าสู่ระบบไม่สำเร็จ",
            description: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
            variant: "destructive"
          });
        } else {
          toast({
            title: "เข้าสู่ระบบไม่สำเร็จ",
            description: error.message,
            variant: "destructive"
          });
        }
        return;
      }
      toast({
        title: "เข้าสู่ระบบสำเร็จ",
        description: "ยินดีต้อนรับกลับมา"
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (!signupRateLimiter(email)) {
      toast({
        title: "พยายามลงทะเบียนมากเกินไป",
        description: "กรุณารอ 1 ชั่วโมงแล้วลองใหม่อีกครั้ง",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateInputs(true)) return;
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const sanitizedName = sanitizeInput(fullName);
      
      const {
        error
      } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: sanitizedName
          }
        }
      });
      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "ลงทะเบียนไม่สำเร็จ",
            description: "อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ",
            variant: "destructive"
          });
        } else {
          toast({
            title: "ลงทะเบียนไม่สำเร็จ",
            description: error.message,
            variant: "destructive"
          });
        }
        return;
      }
      toast({
        title: "ลงทะเบียนสำเร็จ",
        description: "ยินดีต้อนรับ! กำลังนำคุณเข้าสู่ระบบ..."
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    try {
      emailSchema.parse(forgotPasswordEmail.trim());
    } catch (error) {
      toast({
        title: "อีเมลไม่ถูกต้อง",
        description: "กรุณากรอกอีเมลที่ถูกต้อง",
        variant: "destructive"
      });
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      // First, trigger Supabase password reset to generate token
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        forgotPasswordEmail.trim().toLowerCase(),
        {
          redirectTo: redirectUrl,
        }
      );

      if (resetError) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: resetError.message,
          variant: "destructive"
        });
        return;
      }

      // Then send custom email via edge function
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reset-password-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              email: forgotPasswordEmail.trim().toLowerCase(),
              resetLink: redirectUrl,
            }),
          }
        );

        if (!response.ok) {
          console.error("Failed to send custom email, but Supabase email sent");
        }
      } catch (emailError) {
        console.error("Error sending custom email:", emailError);
        // Don't fail the whole process if custom email fails
      }

      toast({
        title: "ส่งอีเมลสำเร็จ",
        description: "กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน"
      });

      setForgotPasswordOpen(false);
      setForgotPasswordEmail("");
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };
  return <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">MATERIAL EXCEANGE RATE API</CardTitle>
          <CardDescription className="text-center">
            เข้าสู่ระบบหรือลงทะเบียนเพื่อใช้งาน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">เข้าสู่ระบบ</TabsTrigger>
              <TabsTrigger value="signup">ลงทะเบียน</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">อีเมล</Label>
                  <Input id="signin-email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">รหัสผ่าน</Label>
                  <Input id="signin-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>
                
                <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="w-full text-sm" type="button">
                      ลืมรหัสผ่าน?
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
                      <DialogDescription>
                        กรอกอีเมลที่คุณใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้คุณ
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">อีเมล</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="your@email.com"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          required
                          disabled={forgotPasswordLoading}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={forgotPasswordLoading}>
                        {forgotPasswordLoading ? "กำลังส่งอีเมล..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">ชื่อ-นามสกุล</Label>
                  <Input id="signup-name" type="text" placeholder="สมชาย ใจดี" value={fullName} onChange={e => setFullName(e.target.value)} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">อีเมล</Label>
                  <Input id="signup-email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">รหัสผ่าน</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    disabled={loading} 
                  />
                  <p className="text-xs text-muted-foreground">
                    ต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก ตัวเลข และอักขระพิเศษ
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};
export default Auth;