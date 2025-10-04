import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ResetPasswordEmailProps {
  resetLink: string;
}

export const ResetPasswordEmail = ({ resetLink }: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>รีเซ็ตรหัสผ่านของคุณ - Reset Your Password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>รีเซ็ตรหัสผ่าน</Heading>
        <Text style={text}>
          คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ
        </Text>
        <Text style={text}>
          คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:
        </Text>
        <Section style={buttonContainer}>
          <Link
            href={resetLink}
            target="_blank"
            style={button}
          >
            รีเซ็ตรหัสผ่าน
          </Link>
        </Section>
        <Text style={text}>
          หรือคัดลอกและวางลิงก์นี้ในเบราว์เซอร์ของคุณ:
        </Text>
        <Text style={linkText}>{resetLink}</Text>
        <Hr style={hr} />
        <Text style={footer}>
          ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง
        </Text>
        <Text style={footer}>
          หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยอีเมลนี้
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Material Exchange Rate API
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#0066cc',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 40px',
};

const linkText = {
  color: '#0066cc',
  fontSize: '14px',
  margin: '16px 0',
  padding: '0 40px',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};
