"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminCard } from "@/components/admin/admin-card";
import {
  useBrands,
  useCategories,
  useColors,
  useSizes,
} from "@/hooks/use-catalog";
import { slugify } from "@/lib/utils";
import { productSchema, type ProductFormInput } from "@/lib/validation/product";

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

  const specs = useFieldArray({
    control: form.control,
    name: "specifications",
  });
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
            admin
            required
            error={errors.name?.message}
            containerClassName="lg:col-span-2"
            {...form.register("name")}
          />
          <Input
            label="Slug"
            admin
            required
            hint="URL-friendly, tự động generate từ tên — sửa thủ công nếu cần."
            error={errors.slug?.message}
            {...form.register("slug")}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-200">Hiển thị</span>
            <label className="text-admin-text inline-flex items-center gap-2 px-2 py-2.5 text-sm">
              <input
                type="checkbox"
                {...form.register("isVisible")}
                className="h-4 w-4 accent-primary-400"
              />
              <span>Hiển thị trên storefront</span>
            </label>
          </div>

          <Select
            label="Danh mục"
            admin
            required
            error={errors.categoryId?.message}
            defaultValue={0}
            {...form.register("categoryId", { valueAsNumber: true })}
          >
            <option value={0}>-- Chọn danh mục --</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            label="Thương hiệu"
            admin
            required
            error={errors.brandId?.message}
            defaultValue={0}
            {...form.register("brandId", { valueAsNumber: true })}
          >
            <option value={0}>-- Chọn thương hiệu --</option>
            {(brands.data ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>

          <Textarea
            label="Mô tả"
            admin
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
              Optional khi sửa — chỉ upload nếu muốn thay ảnh cũ. PNG/JPG, ≤
              5MB.
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
                  admin
                  placeholder="Tên (vd: Trọng lượng)"
                  error={errors.specifications?.[idx]?.name?.message}
                  {...form.register(`specifications.${idx}.name`)}
                />
                <Input
                  admin
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
              <Select
                label="Màu"
                admin
                error={errors.variants?.[idx]?.colorId?.message}
                defaultValue={0}
                {...form.register(`variants.${idx}.colorId`, {
                  valueAsNumber: true,
                })}
                containerClassName="col-span-3"
              >
                <option value={0}>--</option>
                {(colors.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Cỡ"
                admin
                error={errors.variants?.[idx]?.sizeId?.message}
                defaultValue={0}
                {...form.register(`variants.${idx}.sizeId`, {
                  valueAsNumber: true,
                })}
                containerClassName="col-span-2"
              >
                <option value={0}>--</option>
                {(sizes.data ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <Input
                label="SKU"
                admin
                placeholder="ASTROX-88D-RED-4U"
                error={errors.variants?.[idx]?.skuCode?.message}
                containerClassName="col-span-3"
                {...form.register(`variants.${idx}.skuCode`)}
              />
              <Input
                label="Giá gốc"
                admin
                type="number"
                error={errors.variants?.[idx]?.price?.message}
                containerClassName="col-span-2"
                {...form.register(`variants.${idx}.price`, {
                  valueAsNumber: true,
                })}
              />
              <Input
                label="Giá sale"
                admin
                type="number"
                hint="Bỏ trống nếu không"
                containerClassName="col-span-1"
                {...form.register(`variants.${idx}.salePrice`, {
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
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
        <Button type="submit" variant="admin-primary" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
