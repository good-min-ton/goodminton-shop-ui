import { z } from "zod";

export const productSpecSchema = z.object({
  name: z.string().min(1, "Tên không được trống").max(80),
  value: z.string().min(1, "Giá trị không được trống").max(255),
});

export const productVariantSchema = z.object({
  /** Existing variant id — present = UPDATE in place; absent = CREATE new. */
  id: z.number().int().positive().optional(),
  /**
   * Optional axis. The admin form ships `0` for the "--" option; we accept it
   * here and convert to `undefined` in `ProductForm.submit` before hitting
   * the backend so the variant row lands with `color_id = null`.
   */
  colorId: z.number().int().nonnegative().optional(),
  sizeId: z.number().int().nonnegative().optional(),
  skuCode: z.string().min(2, "SKU tối thiểu 2 ký tự").max(60),
  price: z.number().int().positive("Giá phải > 0"),
  salePrice: z.number().int().nonnegative().nullable().optional(),
});

/**
 * Giá sale phải THẤP HƠN giá gốc.
 *
 * Không phải chuyện hiển thị: khi đặt hàng backend luôn thu theo salePrice nếu
 * nó khác null, trong khi trang sản phẩm chỉ gạch giá cũ khi salePrice < price.
 * Đặt sale cao hơn giá gốc thì khách nhìn thấy một giá và bị tính một giá khác.
 */
const variantWithValidSale = productVariantSchema.refine(
  (v) => v.salePrice == null || v.salePrice < v.price,
  { message: "Giá sale phải thấp hơn giá gốc", path: ["salePrice"] },
);

/** Khoá của một tổ hợp màu × cỡ; trục để trống gộp về một ký hiệu chung để
 *  "không phân màu" đụng với "không phân màu". Ràng buộc UNIQUE dưới DB không
 *  bắt được trường hợp này vì PostgreSQL coi NULL là khác nhau. */
function axisKey(v: { colorId?: number; sizeId?: number }): string {
  return `${v.colorId ?? 0}/${v.sizeId ?? 0}`;
}

export const productSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(255),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang"),
  // HTML rich-text: images/videos embed as URL strings + markup overhead → 100k.
  description: z.string().max(100000).optional(),
  categoryId: z.number().int().positive("Chọn danh mục"),
  brandId: z.number().int().positive("Chọn thương hiệu"),
  relatedProductId: z.number().int().nullable().optional(),
  isVisible: z.boolean(),
  specifications: z.array(productSpecSchema),
  variants: z
    .array(variantWithValidSale)
    .min(1, "Cần tối thiểu 1 phiên bản")
    .superRefine((list, ctx) => {
      const seen = new Map<string, number>();
      list.forEach((v, i) => {
        const k = axisKey(v);
        const dau = seen.get(k);
        if (dau !== undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Trùng tổ hợp màu × cỡ với phiên bản #${dau + 1}`,
            path: [i, "colorId"],
          });
        } else {
          seen.set(k, i);
        }
      });
    }),
});

export type ProductFormInput = z.infer<typeof productSchema>;
