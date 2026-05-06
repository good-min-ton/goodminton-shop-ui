"use client";

import { forwardRef, useEffect, useState } from "react";
import { useFieldArray, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-card";
import {
  useBrands,
  useCategories,
  useColors,
  useSizes,
} from "@/hooks/use-catalog";
import { slugify } from "@/lib/utils";
import {
  productSchema,
  type ProductFormInput,
} from "@/lib/validation/product";

interface ProductFormProps {
  initial?: Partial<ProductFormInput>;
  initialThumbnailUrl?: string | null;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: ProductFormInput, thumbnail: File | null) => void;
}

const EMPTY_VARIANT = {
  colorId: 0,
  sizeId: 0,
  skuCode: "",
  price: 0,
  salePrice: null,
};

export function ProductForm({
  initial,
  initialThumbnailUrl,
  submitting,
  submitLabel = "Lưu",
  onSubmit,
}: Readonly<ProductFormProps>) {
  const categories = useCategories();
  const brands = useBrands();
  const colors = useColors();
  const sizes = useSizes();

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialThumbnailUrl ?? null,
  );

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      categoryId: initial?.categoryId ?? 0,
      brandId: initial?.brandId ?? 0,
      relatedProductId: initial?.relatedProductId ?? null,
      isVisible: initial?.isVisible ?? true,
      specifications: initial?.specifications ?? [],
      variants:
        initial?.variants && initial.variants.length > 0
          ? initial.variants
          : [{ ...EMPTY_VARIANT }],
    },
  });

  const specs = useFieldArray({ control: form.control, name: "specifications" });
  const variants = useFieldArray({ control: form.control, name: "variants" });

  const watchName = form.watch("name");
  const watchSlug = form.watch("slug");

  useEffect(() => {
    if (!initial?.slug && watchName && !watchSlug) {
      form.setValue("slug", slugify(watchName), { shouldValidate: false });
    }
  }, [watchName, watchSlug, form, initial?.slug]);

  function onPickThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  const submit: SubmitHandler<ProductFormInput> = (values) => {
    onSubmit(values, thumbnail);
  };

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
      <AdminCard>
        <h2 className="font-display text-admin-text-muted mb-5 text-[11px] font-bold tracking-widest uppercase">
          Thông tin chung
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            label="Tên sản phẩm"
            required
            error={errors.name?.message}
            containerClassName="lg:col-span-2"
            {...form.register("name")}
          />
          <Input
            label="Slug"
            required
            hint="URL-friendly, tự động generate từ tên — sửa thủ công nếu cần."
            error={errors.slug?.message}
            {...form.register("slug")}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">
              Hiển thị
            </label>
            <label className="inline-flex items-center gap-2 px-2 py-2.5 text-sm">
              <input
                type="checkbox"
                {...form.register("isVisible")}
                className="h-4 w-4"
              />
              <span>Hiển thị trên storefront</span>
            </label>
          </div>

          <SelectField
            label="Danh mục"
            required
            error={errors.categoryId?.message}
            {...form.register("categoryId", { valueAsNumber: true })}
            options={(categories.data ?? []).map((c) => ({
              value: c.id,
              label: c.name,
            }))}
          />
          <SelectField
            label="Thương hiệu"
            required
            error={errors.brandId?.message}
            {...form.register("brandId", { valueAsNumber: true })}
            options={(brands.data ?? []).map((b) => ({
              value: b.id,
              label: b.name,
            }))}
          />

          <Textarea
            label="Mô tả"
            rows={4}
            error={errors.description?.message}
            containerClassName="lg:col-span-2"
            {...form.register("description")}
          />
        </div>
      </AdminCard>

      <AdminCard>
        <h2 className="font-display text-admin-text-muted mb-5 text-[11px] font-bold tracking-widest uppercase">
          Ảnh đại diện
        </h2>
        <div className="flex items-start gap-4">
          <div className="bg-admin-surface-2 flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
            {thumbnailPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="h-full w-full object-contain"
              />
            ) : (
              <ImageIcon size={32} className="text-admin-text-muted" />
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={onPickThumbnail}
              className="text-admin-text-muted file:bg-admin-surface-2 file:border-admin-border file:text-admin-text hover:file:bg-admin-surface-2/80 block w-full text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:text-sm"
            />
            <p className="text-admin-text-muted mt-2 text-xs">
              Optional khi sửa — chỉ upload nếu muốn thay ảnh cũ. PNG/JPG, ≤ 5MB.
            </p>
          </div>
        </div>
      </AdminCard>

      <AdminCard>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-admin-text-muted text-[11px] font-bold tracking-widest uppercase">
            Thông số kỹ thuật
          </h2>
          <Button
            type="button"
            variant="admin-ghost"
            size="sm"
            onClick={() => specs.append({ name: "", value: "" })}
          >
            <Plus size={14} />
            Thêm dòng
          </Button>
        </div>
        {specs.fields.length === 0 ? (
          <p className="text-admin-text-muted text-sm italic">
            Chưa có thông số. Bấm "Thêm dòng".
          </p>
        ) : (
          <div className="space-y-2">
            {specs.fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_2fr_auto] gap-2"
              >
                <Input
                  placeholder="Tên (vd: Trọng lượng)"
                  error={errors.specifications?.[idx]?.name?.message}
                  {...form.register(`specifications.${idx}.name`)}
                />
                <Input
                  placeholder="Giá trị (vd: 83g)"
                  error={errors.specifications?.[idx]?.value?.message}
                  {...form.register(`specifications.${idx}.value`)}
                />
                <button
                  type="button"
                  onClick={() => specs.remove(idx)}
                  className="text-admin-text-muted self-start rounded-md p-2.5 hover:bg-red-500/10 hover:text-red-400"
                  aria-label="Xoá"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <AdminCard>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-admin-text-muted text-[11px] font-bold tracking-widest uppercase">
              Phiên bản (variants)
            </h2>
            <p className="text-admin-text-muted mt-1 text-xs">
              Mỗi tổ hợp màu × cỡ là một variant với SKU + giá riêng.
            </p>
          </div>
          <Button
            type="button"
            variant="admin-ghost"
            size="sm"
            onClick={() => variants.append({ ...EMPTY_VARIANT })}
          >
            <Plus size={14} />
            Thêm variant
          </Button>
        </div>

        {errors.variants?.message && (
          <p className="mb-3 text-sm text-red-400">{errors.variants.message}</p>
        )}

        <div className="space-y-3">
          {variants.fields.map((field, idx) => (
            <div
              key={field.id}
              className="bg-admin-surface-2 grid grid-cols-12 gap-2 rounded-lg p-3"
            >
              <SelectField
                label="Màu"
                error={errors.variants?.[idx]?.colorId?.message}
                {...form.register(`variants.${idx}.colorId`, { valueAsNumber: true })}
                options={(colors.data ?? []).map((c) => ({
                  value: c.colorId,
                  label: c.name,
                }))}
                containerClassName="col-span-3"
              />
              <SelectField
                label="Cỡ"
                error={errors.variants?.[idx]?.sizeId?.message}
                {...form.register(`variants.${idx}.sizeId`, { valueAsNumber: true })}
                options={(sizes.data ?? []).map((s) => ({
                  value: s.sizeId,
                  label: s.name,
                }))}
                containerClassName="col-span-2"
              />
              <Input
                label="SKU"
                placeholder="ASTROX-88D-RED-4U"
                error={errors.variants?.[idx]?.skuCode?.message}
                containerClassName="col-span-3"
                {...form.register(`variants.${idx}.skuCode`)}
              />
              <Input
                label="Giá gốc"
                type="number"
                error={errors.variants?.[idx]?.price?.message}
                containerClassName="col-span-2"
                {...form.register(`variants.${idx}.price`, { valueAsNumber: true })}
              />
              <Input
                label="Giá sale"
                type="number"
                hint="Bỏ trống nếu không"
                containerClassName="col-span-1"
                {...form.register(`variants.${idx}.salePrice`, { setValueAs: (v) => (v === "" ? null : Number(v)) })}
              />
              <button
                type="button"
                onClick={() => variants.remove(idx)}
                disabled={variants.fields.length === 1}
                className="text-admin-text-muted col-span-1 self-end justify-self-end rounded-md p-2.5 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Xoá variant"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </AdminCard>

      <div className="flex justify-end gap-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

interface SelectOption {
  value: number | string;
  label: string;
}

interface SelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  required?: boolean;
  error?: string;
  options: SelectOption[];
  containerClassName?: string;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    {
      label,
      required,
      error,
      options,
      containerClassName,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName ?? ""}`}>
        {label && (
          <label className="text-sm font-medium text-stone-700">
            {label}
            {required && <span className="ml-1 text-red-400">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`rounded-lg border-[1.5px] border-stone-200 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-primary-700 ${className ?? ""}`}
          {...rest}
        >
          <option value={0}>-- Chọn --</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-[13px] text-red-400">{error}</span>}
      </div>
    );
  },
);
