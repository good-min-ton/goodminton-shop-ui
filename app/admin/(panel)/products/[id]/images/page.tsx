"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Upload, ImageIcon, Star } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useProduct } from "@/hooks/use-products";
import { productsApi } from "@/lib/api/products";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";

export default function ProductImagesPage() {
  const params = useParams<{ id: string }>();
  const productId = params?.id ? Number(params.id) : 0;
  const qc = useQueryClient();
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [pickedPreview, setPickedPreview] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const product = useProduct(productId > 0 ? productId : null);

  const upload = useMutation({
    mutationFn: () => {
      if (!pickedFile) throw new Error("No file selected");
      return productsApi.uploadImage(productId, pickedFile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", "detail", productId] });
      toast("Đã upload ảnh", "success");
      setPickedFile(null);
      if (pickedPreview) URL.revokeObjectURL(pickedPreview);
      setPickedPreview(null);
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Không upload được"), "error");
    },
  });

  const remove = useMutation({
    mutationFn: (imageId: number) => productsApi.removeImage(imageId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products", "detail", productId] });
      toast("Đã xoá ảnh", "success");
      setDeletingId(null);
    },
    onError: (err) => {
      toast(getErrorMessage(err), "error");
    },
  });

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pickedPreview) URL.revokeObjectURL(pickedPreview);
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

  if (!product.data) {
    return <EmptyState title="Không tìm thấy sản phẩm" />;
  }

  const p = product.data;
  // Backend orders by sortOrder; first item is the thumbnail (sortOrder=0).
  const [thumbnail, ...extras] = p.images;

  return (
    <>
      <AdminPageHeader
        title="Quản lý ảnh sản phẩm"
        description={`Bộ ảnh dùng chung cho tất cả phiên bản của ${p.name}.`}
        breadcrumbs={[
          { label: "Sản phẩm", href: "/admin/products" },
          { label: p.name, href: `/admin/products/${p.id}` },
          { label: "Ảnh" },
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
                className="h-full w-full object-cover"
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
              PNG/JPG/WebP, ≤ 5MB. Ảnh sẽ được append vào cuối gallery. Để đổi
              ảnh chính (thumbnail), dùng form Sửa sản phẩm với field thumbnail.
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
          Gallery ({p.images.length} ảnh)
        </h2>
        {p.images.length === 0 ? (
          <div className="text-admin-text-muted flex flex-col items-center gap-2 py-12 text-sm">
            <ImageIcon size={32} className="opacity-40" />
            <span>Chưa có ảnh nào.</span>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4">
            {thumbnail && (
              <li
                key={thumbnail.id}
                className="bg-admin-surface-2 group relative aspect-square overflow-hidden rounded-lg ring-2 ring-amber-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnail.url}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span
                  title="Ảnh chính — đổi qua form Sửa sản phẩm"
                  className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-amber-400/95 px-1.5 py-0.5 text-[10px] font-semibold text-stone-900"
                >
                  <Star size={10} className="fill-stone-900" />
                  Thumbnail
                </span>
              </li>
            )}
            {extras.map((img) => (
              <li
                key={img.id}
                className="bg-admin-surface-2 group relative aspect-square overflow-hidden rounded-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`Product image ${img.id}`}
                  className="h-full w-full object-cover"
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
