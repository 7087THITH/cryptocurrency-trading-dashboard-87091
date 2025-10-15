import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
  resetLink: string;
}

function buildEmailHtml(link: string): string {
  return `
    <!doctype html>
    <html lang="th">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>รีเซ็ตรหัสผ่าน</title>
        <style>
          body{font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; background:#f6f7f9; margin:0; padding:24px;}
          .card{max-width:520px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; padding:24px;}
          .title{font-size:20px; font-weight:700; margin:0 0 12px; color:#111827}
          .text{font-size:14px; color:#374151; line-height:1.6;}
          .btn{display:inline-block; margin-top:16px; background:#2563eb; color:#fff; text-decoration:none; padding:10px 16px; border-radius:8px; font-weight:600}
          .footer{font-size:12px; color:#6b7280; margin-top:24px}
        </style>
      </head>
      <body>
        <div class="card">
          <h1 class="title">รีเซ็ตรหัสผ่านของคุณ</h1>
          <p class="text">คลิกปุ่มด้านล่างเพื่อเปลี่ยนรหัสผ่านใหม่ของคุณอย่างปลอดภัย</p>
          <a class="btn" href="${link}" target="_blank" rel="noopener">รีเซ็ตรหัสผ่าน</a>
          <p class="text" style="margin-top:16px;">หากปุ่มคลิกไม่ได้ ให้คัดลอกลิงก์นี้ไปวางในเบราว์เซอร์ของคุณ:<br />
          <span style="word-break:break-all;">${link}</span></p>
          <p class="footer">หากคุณไม่ได้ร้องขอ สามารถเพิกเฉยอีเมลนี้ได้</p>
        </div>
      </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink }: ResetPasswordRequest = await req.json();

    if (!email || !resetLink) {
      return new Response(
        JSON.stringify({ error: "Email and resetLink are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const html = buildEmailHtml(resetLink);

    const emailResponse = await resend.emails.send({
      from: "Material Exchange Rate <onboarding@resend.dev>",
      to: [email],
      subject: "รีเซ็ตรหัสผ่านของคุณ - Reset Your Password",
      html,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending password reset email:", error); // Log detailed error server-side only
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send password reset email',
        code: 'EMAIL_ERROR'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
