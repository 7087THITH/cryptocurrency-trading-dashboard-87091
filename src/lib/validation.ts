import { z } from 'zod';

// Profile validation schema
export const profileSchema = z.object({
  full_name: z.string()
    .trim()
    .min(1, { message: "ชื่อ-นามสกุลไม่สามารถว่างได้" })
    .max(100, { message: "ชื่อ-นามสกุลต้องไม่เกิน 100 ตัวอักษร" })
    .regex(/^[a-zA-Z\u0E00-\u0E7F\s]+$/, { message: "ชื่อ-นามสกุลต้องเป็นตัวอักษรเท่านั้น" }),
});

// Email validation
export const emailSchema = z.string()
  .trim()
  .email({ message: "รูปแบบอีเมลไม่ถูกต้อง" })
  .max(255, { message: "อีเมลต้องไม่เกิน 255 ตัวอักษร" });

// Password validation with strong requirements
export const passwordSchema = z.string()
  .min(8, { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" })
  .max(100, { message: "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร" })
  .regex(/[A-Z]/, { message: "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว" })
  .regex(/[a-z]/, { message: "รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว" })
  .regex(/[0-9]/, { message: "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว" })
  .regex(/[^A-Za-z0-9]/, { message: "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว" });

// Auth form validation
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: profileSchema.shape.full_name,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "กรุณาใส่รหัสผ่าน" }),
});

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .slice(0, 1000); // Limit length
};

// Rate limiting helper (client-side)
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetAt: number }>();

  return (key: string): boolean => {
    const now = Date.now();
    const record = attempts.get(key);

    if (!record || now > record.resetAt) {
      attempts.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  };
};

// Create rate limiters for different actions
export const loginRateLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const signupRateLimiter = createRateLimiter(3, 60 * 60 * 1000); // 3 attempts per hour
