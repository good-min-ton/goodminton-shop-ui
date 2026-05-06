"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useProduct } from "@/hooks/use-products";
import { productsApi } from "@/lib/api/products";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import type { ProductFormInput } from "@/lib/validation/product";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number(params.id) : null;
  const router = useRouter();

  const product = useProduct(id);

  const update = useMutation({
    mutationFn: ({
      values,
      thumbnail,
    }: {
      values: ProductFormInput;
      thumbnail: File | null;
    }) => productsApi.update(id as number, values, thumbnail),
    onSuccess: (p) => {
      toast("Đã cập nhật sản phẩm", "success");
      router.replace(`/admin/products/${p.productId}`);
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code, "Không cập nhật được sản phẩm"), "error");
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
        title={`Sửa: ${p.name}`}
        breadcrumbs={[
          { label: "Sản phẩm", href: "/admin/products" },
          { label: `#${p.productId}`, href: `/admin/products/${p.productId}` },
          { label: "Sửa" },
        ]}
      />

      <ProductForm
        initial={{
          name: p.name,
          slug: p.slug,
          description: p.description,
          categoryId: p.category.id,
          brandId: p.brand.id,
          relatedProductId: p.relatedProductId,
          isVisible: p.isVisible,
          specifications: p.specifications.map((s) => ({
            name: s.name,
            value: s.value,
          })),
          variants: p.variants.map((v) => ({
            colorId: v.color.colorId,
            sizeId: v.size.sizeId,
            skuCode: v.skuCode,
            price: v.price,
            salePrice: v.salePrice,
          })),
        }}
        initialThumbnailUrl={p.thumbnail?.url ?? null}
        submitting={update.isPending}
        submitLabel="Lưu thay đổi"
        onSubmit={(values, thumbnail) =>
          update.mutate({ values, thumbnail })
        }
      />
    </>
  );
}
