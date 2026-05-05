import { z } from "zod";

const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên quá dài"),
  phone: z.string().regex(phoneRegex, "Số điện thoại Việt Nam không hợp lệ"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới cần tối thiểu 8 ký tự")
      .max(72),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  })
  .refine((d) => d.oldPassword !== d.newPassword, {
    path: ["newPassword"],
    message: "Mật khẩu mới phải khác mật khẩu cũ",
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
