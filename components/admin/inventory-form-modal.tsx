"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { inventoriesApi } from "@/lib/api/inventories";
import { useProductList } from "@/hooks/use-products";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import type { Inventory, Product, ProductVariant } from "@/types/api";

/** Parse <input type="number"> raw value, keeping "" empty so user can clear the field. */
function parseQty(raw: string): number | "" {
  if (raw === "") return "";
  const n = Number(raw);
  if (Number.isNaN(n)) return "";
  return Math.max(0, Math.floor(n));
}

interface InventoryFormModalProps {
  open: boolean;
  storeId: number | null;
  /** Non-null = edit mode (qty only). Null = add mode (pick product + variant). */
  editing: Inventory | null;
  /** All current inventory rows for this store — used to hide variants already stocked. */
  existingInventory: Inventory[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function InventoryFormModal({
  open,
  storeId,
  editing,
  existingInventory,
  onClose,
  onSuccess,
}: Readonly<InventoryFormModalProps>) {
  const qc = useQueryClient();
  const isEdit = editing !== null;

  const [productId, setProductId] = useState<number | "">("");
  const [variantId, setVariantId] = useState<number | "">("");
  const [qty, setQty] = useState<number | "">("");

  const products = useProductList(
    { page: 1, size: 200 },
    { refetchOnMount: false },
  );

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setProductId(editing.productId);
      setVariantId(editing.variantId);
      setQty(editing.quantity);
    } else {
      setProductId("");
      setVariantId("");
      setQty("");
    }
  }, [open, editing]);

  const stockedVariantIds = useMemo(
    () => new Set(existingInventory.map((i) => i.variantId)),
    [existingInventory],
  );

  const selectedProduct = useMemo<Product | null>(() => {
    if (!productId) return null;
    return products.data?.content.find((p) => p.id === productId) ?? null;
  }, [products.data, productId]);

  const variantOptions = useMemo<ProductVariant[]>(() => {
    if (!selectedProduct) return [];
    if (isEdit) return selectedProduct.variants;
    return selectedProduct.variants.filter((v) => !stockedVariantIds.has(v.id));
  }, [selectedProduct, stockedVariantIds, isEdit]);

  const submit = useMutation({
    mutationFn: () => {
      if (!storeId) throw new Error("Chưa xác định được chi nhánh");
      if (!variantId) throw new Error("Vui lòng chọn variant");
      return inventoriesApi.set({
        storeId,
        variantId,
        quantity: qty === "" ? 0 : qty,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventories"] });
      qc.invalidateQueries({ queryKey: ["my-store-inventory"] });
      toast(isEdit ? "Đã cập nhật tồn kho" : "Đã thêm tồn kho", "success");
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      toast(getErrorMessage(err), "error");
    },
  });

  const canSubmit =
    storeId != null &&
    variantId !== "" &&
    qty !== "" &&
    qty >= 0 &&
    !submit.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isEdit
          ? `Cập nhật tồn kho · ${editing?.skuCode ?? ""}`
          : "Thêm tồn kho mới"
      }
      theme="dark"
      footer={
        <>
          <Button
            variant="admin-ghost"
            onClick={onClose}
            disabled={submit.isPending}
          >
            Huỷ
          </Button>
          <Button
            variant="admin-primary"
            onClick={() => submit.mutate()}
            loading={submit.isPending}
            disabled={!canSubmit}
          >
            {isEdit ? "Cập nhật" : "Thêm"}
          </Button>
        </>
      }
    >
      {isEdit && editing ? (
        <div className="space-y-4">
          <div className="bg-admin-surface-2 border-admin-border rounded-lg border px-3 py-2.5 text-sm">
            <p className="text-admin-text font-medium">{editing.productName}</p>
            <p className="text-admin-text-muted mt-0.5 text-xs">
              {editing.color.name} · {editing.size.name} · SKU{" "}
              <span className="font-mono">{editing.skuCode}</span>
            </p>
          </div>
          <Input
            label="Số lượng"
            admin
            type="number"
            min={0}
            value={qty}
            onChange={(e) => setQty(parseQty(e.target.value))}
            hint="Nhập số tuyệt đối — sẽ ghi đè số hiện tại."
          />
        </div>
      ) : (
        <AddBody
          loading={products.isLoading}
          products={products.data?.content ?? []}
          productId={productId}
          variantId={variantId}
          variantOptions={variantOptions}
          qty={qty}
          onProductChange={(id) => {
            setProductId(id);
            setVariantId("");
          }}
          onVariantChange={setVariantId}
          onQtyChange={setQty}
        />
      )}
    </Modal>
  );
}

interface AddBodyProps {
  loading: boolean;
  products: Product[];
  productId: number | "";
  variantId: number | "";
  variantOptions: ProductVariant[];
  qty: number | "";
  onProductChange: (id: number | "") => void;
  onVariantChange: (id: number | "") => void;
  onQtyChange: (qty: number | "") => void;
}

function AddBody({
  loading,
  products,
  productId,
  variantId,
  variantOptions,
  qty,
  onProductChange,
  onVariantChange,
  onQtyChange,
}: Readonly<AddBodyProps>) {
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner className="text-primary-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Select
        label="Sản phẩm"
        admin
        required
        value={productId}
        onChange={(e) =>
          onProductChange(e.target.value ? Number(e.target.value) : "")
        }
      >
        <option value="" disabled>
          -- Chọn sản phẩm --
        </option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>

      <Select
        label="Phiên bản (variant)"
        admin
        required
        value={variantId}
        onChange={(e) =>
          onVariantChange(e.target.value ? Number(e.target.value) : "")
        }
        disabled={!productId}
        hint={
          productId && variantOptions.length === 0
            ? "Sản phẩm này không còn variant nào trống — tất cả đã có tồn kho. Sửa số lượng ở row tương ứng."
            : undefined
        }
      >
        <option value="" disabled>
          -- Chọn variant --
        </option>
        {variantOptions.map((v) => (
          <option key={v.id} value={v.id}>
            {v.color.name} · {v.size.name} · {v.skuCode}
          </option>
        ))}
      </Select>

      <Input
        label="Số lượng"
        admin
        type="number"
        min={0}
        value={qty}
        onChange={(e) => onQtyChange(parseQty(e.target.value))}
        hint="Nhập số tuyệt đối tồn kho ban đầu."
      />
    </div>
  );
}
