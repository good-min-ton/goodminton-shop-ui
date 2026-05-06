import { z } from "zod";

export const productSpecSchema = z.object({
  name: z.string().min(1, "Tên không được trống").max(80),
  value: z.string().min(1, "Giá trị không được trống").max(255),
});

export const productVariantSchema = z.object({
  colorId: z.number().int().positive("Chọn màu"),
  sizeId: z.number().int().positive("Chọn cỡ"),
  skuCode: z.string().min(2, "SKU tối thiểu 2 ký tự").max(60),
  price: z.number().int().positive("Giá phải > 0"),
  salePrice: z.number().int().nonnegative().nullable().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(255),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang"),
  description: z.string().max(5000).optional(),
  categoryId: z.number().int().positive("Chọn danh mục"),
  brandId: z.number().int().positive("Chọn thương hiệu"),
  relatedProductId: z.number().int().nullable().optional(),
  isVisible: z.boolean(),
  specifications: z.array(productSpecSchema),
  variants: z
    .array(productVariantSchema)
    .min(1, "Cần tối thiểu 1 phiên bản"),
});

export type ProductFormInput = z.infer<typeof productSchema>;
