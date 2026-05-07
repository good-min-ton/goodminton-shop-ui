"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { productsApi } from "@/lib/api/products";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import type { ProductFormInput } from "@/lib/validation/product";

export default function CreateProductPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: ({
      values,
      thumbnail,
    }: {
      values: ProductFormInput;
      thumbnail: File | null;
    }) => productsApi.create(values, thumbnail),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast(`Đã tạo sản phẩm "${p.name}"`, "success");
      router.replace(`/admin/products/${p.productId}`);
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Không tạo được sản phẩm"), "error");
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Tạo sản phẩm"
        breadcrumbs={[
          { label: "Sản phẩm", href: "/admin/products" },
          { label: "Tạo mới" },
        ]}
      />

      <ProductForm
        submitting={create.isPending}
        submitLabel="Tạo sản phẩm"
        onSubmit={(values, thumbnail) =>
          create.mutate({ values, thumbnail })
        }
      />
    </>
  );
}
