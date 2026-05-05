import { z } from "zod";

const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;

export const checkoutSchema = z.object({
  recipientName: z
    .string()
    .min(2, "Vui lòng nhập họ tên người nhận")
    .max(100, "Tên quá dài"),
  recipientPhone: z
    .string()
    .regex(phoneRegex, "Số điện thoại Việt Nam không hợp lệ"),
  recipientAddress: z
    .string()
    .min(8, "Vui lòng nhập địa chỉ đầy đủ")
    .max(255, "Địa chỉ quá dài"),
  recipientEmail: z
    .union([z.literal(""), z.string().email("Email không hợp lệ")])
    .optional(),
  note: z.string().max(500).optional(),
  paymentMethod: z.enum(["COD", "BANKING", "VNPAY"]),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
