"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, ImageIcon } from "lucide-react";
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
import { formatVnd } from "@/lib/utils";

export default function AdminProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number(params.id) : null;
  const router = useRouter();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const product = useProduct(id);

  const remove = useMutation({
    mutationFn: () => productsApi.remove(id as number),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast("Đã xoá sản phẩm", "success");
      router.replace("/admin/products");
    },
    onError: (err) => {
      toast(
        getErrorMessage(err, "Không xoá được — có thể có sản phẩm liên quan"),
        "error",
      );
    },
  });

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

  return (
    <>
      <AdminPageHeader
        title={p.name}
        breadcrumbs={[
          { label: "Sản phẩm", href: "/admin/products" },
          { label: `#${p.productId}` },
        ]}
        actions={
          <>
            <Link href={`/admin/products/${p.productId}/edit`}>
              <Button variant="admin-ghost">
                <Pencil size={16} />
                Sửa
              </Button>
            </Link>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={16} />
              Xoá
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <AdminCard padded={false}>
            <div className="bg-admin-surface-2 flex aspect-square items-center justify-center overflow-hidden rounded-t-xl">
              {p.thumbnail?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.thumbnail.url}
                  alt={p.name}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <ImageIcon size={48} className="text-admin-text-muted" />
              )}
            </div>
            <div className="p-4">
              <p className="font-mono text-admin-text-muted text-xs">
                {p.slug}
              </p>
              <p className="text-admin-text mt-1 text-sm">
                {p.brand.name} · {p.category.name}
              </p>
              <div className="mt-3">
                {p.isVisible ? (
                  <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                    Đang hiển thị
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-stone-500/10 px-2 py-0.5 text-xs text-stone-400">
                    Đang ẩn
                  </span>
                )}
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="space-y-4">
          {p.description && (
            <AdminCard>
              <h2 className="font-display text-admin-text-muted mb-3 text-[11px] font-bold tracking-widest uppercase">
                Mô tả
              </h2>
              <p className="text-admin-text whitespace-pre-line text-sm leading-relaxed">
                {p.description}
              </p>
            </AdminCard>
          )}

          {p.specifications.length > 0 && (
            <AdminCard padded={false}>
              <h2 className="font-display text-admin-text-muted border-admin-border border-b px-5 py-3 text-[11px] font-bold tracking-widest uppercase">
                Thông số
              </h2>
              <dl className="divide-admin-border divide-y">
                {p.specifications.map((s) => (
                  <div
                    key={s.specId}
                    className="grid grid-cols-[1fr_2fr] px-5 py-2.5 text-sm"
                  >
                    <dt className="text-admin-text-muted">{s.name}</dt>
                    <dd className="text-admin-text">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </AdminCard>
          )}

          <AdminCard padded={false}>
            <h2 className="font-display text-admin-text-muted border-admin-border border-b px-5 py-3 text-[11px] font-bold tracking-widest uppercase">
              Phiên bản ({p.variants.length})
            </h2>
            <div className="divide-admin-border divide-y">
              {p.variants.map((v) => (
                <div
                  key={v.variantId}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-admin-text">{v.skuCode}</p>
                    <p className="text-admin-text-muted text-xs">
                      {v.color.name} · {v.size.name} · {v.images.length} ảnh
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      {v.salePrice != null && v.salePrice < v.price ? (
                        <>
                          <p className="font-mono text-admin-text">
                            {formatVnd(v.salePrice)}
                          </p>
                          <p className="font-mono text-admin-text-muted line-through">
                            {formatVnd(v.price)}
                          </p>
                        </>
                      ) : (
                        <p className="font-mono text-admin-text">
                          {formatVnd(v.price)}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/admin/products/${p.productId}/variants/${v.variantId}/images`}
                      className="text-primary-300 text-xs hover:underline"
                    >
                      Quản lý ảnh
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Xoá sản phẩm?"
        description={`Bạn có chắc muốn xoá "${p.name}"? Tất cả phiên bản, ảnh, và inventory liên quan sẽ bị xoá.`}
        confirmLabel="Xoá"
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </>
  );
}
