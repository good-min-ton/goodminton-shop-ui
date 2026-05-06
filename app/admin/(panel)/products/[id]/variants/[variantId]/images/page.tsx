"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Upload, ImageIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useProduct } from "@/hooks/use-products";
import { productsApi } from "@/lib/api/products";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";

export default function VariantImagesPage() {
  const params = useParams<{ id: string; variantId: string }>();
  const productId = params?.id ? Number(params.id) : null;
  const variantId = params?.variantId ? Number(params.variantId) : null;
  const qc = useQueryClient();
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [pickedPreview, setPickedPreview] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const product = useProduct(productId);
  const variant = product.data?.variants.find((v) => v.variantId === variantId);

  const upload = useMutation({
    mutationFn: () => {
      if (!pickedFile) throw new Error("No file selected");
      return productsApi.uploadVariantImage(variantId as number, pickedFile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", "detail", productId] });
      toast("Đã upload ảnh", "success");
      setPickedFile(null);
      setPickedPreview(null);
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code, "Không upload được"), "error");
    },
  });

  const remove = useMutation({
    mutationFn: (imageId: number) => productsApi.removeVariantImage(imageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", "detail", productId] });
      toast("Đã xoá ảnh", "success");
      setDeletingId(null);
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code), "error");
    },
  });

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPickedFile(file);
    setPickedPreview(URL.createObjectURL(file));
  }

  if (product.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="text-primary-300" size={32} />
      </div>
    );
  }

  if (!product.data || !variant) {
    return <EmptyState title="Không tìm thấy variant" />;
  }

  const p = product.data;

  return (
    <>
      <AdminPageHeader
        title={`Ảnh variant: ${variant.skuCode}`}
        description={`${p.name} · ${variant.color.name} · ${variant.size.name}`}
        breadcrumbs={[
          { label: "Sản phẩm", href: "/admin/products" },
          { label: p.name, href: `/admin/products/${p.productId}` },
          { label: "Ảnh variant" },
        ]}
      />

      <AdminCard className="mb-6">
        <h2 className="font-display text-admin-text-muted mb-4 text-[11px] font-bold tracking-widest uppercase">
          Upload ảnh mới
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          {pickedPreview && (
            <div className="bg-admin-surface-2 flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pickedPreview}
                alt="Preview"
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={onPick}
              className="text-admin-text-muted file:bg-admin-surface-2 file:border-admin-border file:text-admin-text block w-full text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:text-sm"
            />
            <p className="text-admin-text-muted mt-2 text-xs">
              PNG/JPG, ≤ 5MB. Upload thêm để khách hàng xem nhiều góc sản phẩm.
            </p>
          </div>
          <Button
            disabled={!pickedFile}
            loading={upload.isPending}
            onClick={() => upload.mutate()}
          >
            <Upload size={14} />
            Upload
          </Button>
        </div>
      </AdminCard>

      <AdminCard padded={false}>
        <h2 className="font-display text-admin-text-muted border-admin-border border-b px-5 py-3 text-[11px] font-bold tracking-widest uppercase">
          Đã có ({variant.images.length} ảnh)
        </h2>
        {variant.images.length === 0 ? (
          <div className="text-admin-text-muted flex flex-col items-center gap-2 py-12 text-sm">
            <ImageIcon size={32} className="opacity-40" />
            <span>Chưa có ảnh nào.</span>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4">
            {variant.images.map((img) => (
              <li
                key={img.id}
                className="bg-admin-surface-2 group relative aspect-square overflow-hidden rounded-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`Variant image ${img.id}`}
                  className="h-full w-full object-contain p-2"
                  loading="lazy"
                />
                <button
                  onClick={() => setDeletingId(img.id)}
                  className="absolute top-2 right-2 rounded-md bg-red-600/90 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Xoá ảnh"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <ConfirmDialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Xoá ảnh?"
        description="Ảnh sẽ bị xoá khỏi cả database và Cloudinary."
        confirmLabel="Xoá"
        destructive
        loading={remove.isPending}
        onConfirm={() => deletingId != null && remove.mutate(deletingId)}
      />
    </>
  );
}
