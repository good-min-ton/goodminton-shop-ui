import { z } from "zod";

const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Vui lòng nhập email hoặc số điện thoại")
    .max(120, "Quá dài"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .max(100, "Họ tên quá dài"),
    email: z.string().email("Email không hợp lệ"),
    phone: z
      .string()
      .regex(phoneRegex, "Số điện thoại Việt Nam không hợp lệ"),
    password: z
      .string()
      .min(8, "Mật khẩu cần tối thiểu 8 ký tự")
      .max(72, "Mật khẩu quá dài"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Mật khẩu cần tối thiểu 8 ký tự").max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
