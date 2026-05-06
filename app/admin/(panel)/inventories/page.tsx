"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/storefront/pagination";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { storesApi } from "@/lib/api/stores";
import { inventoriesApi } from "@/lib/api/inventories";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import type { Inventory } from "@/types/api";

export default function AdminInventoriesPage() {
  const qc = useQueryClient();
  const [storeId, setStoreId] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Inventory | null>(null);
  const [qty, setQty] = useState(0);

  const stores = useQuery({
    queryKey: ["stores", "list"],
    queryFn: () => storesApi.list(),
  });

  const inv = useQuery({
    queryKey: ["inventories", "by-store", storeId, page],
    queryFn: () =>
      inventoriesApi.byStore(storeId as number, {
        page,
        size: 20,
        sortBy: "updatedAt",
        sortDir: "desc",
      }),
    enabled: storeId !== "",
  });

  const update = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("No inventory selected");
      return inventoriesApi.set({
        storeId: editing.storeId,
        variantId: editing.variantId,
        quantity: qty,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventories"] });
      toast("Đã cập nhật tồn kho", "success");
      setEditing(null);
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code), "error");
    },
  });

  function openEdit(row: Inventory) {
    setEditing(row);
    setQty(row.quantity);
  }

  return (
    <>
      <AdminPageHeader
        title="Kho hàng"
        description="Tồn kho theo từng chi nhánh và variant."
      />

      <div className="mb-5 flex items-center gap-3">
        <span className="text-admin-text-muted text-sm">Chi nhánh:</span>
        <select
          value={storeId}
          onChange={(e) => {
            setStoreId(e.target.value ? Number(e.target.value) : "");
            setPage(1);
          }}
          className="bg-admin-surface text-admin-text border-admin-border rounded-md border px-3 py-1.5 text-sm focus:border-primary-400 focus:outline-none"
        >
          <option value="">-- Chọn chi nhánh --</option>
          {stores.data?.map((s) => (
            <option key={s.storeId} value={s.storeId}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {storeId === "" ? (
        <div className="bg-admin-surface border-admin-border text-admin-text-muted rounded-xl border py-16 text-center text-sm">
          Vui lòng chọn chi nhánh để xem tồn kho.
        </div>
      ) : (
        <>
          <DataTable
            columns={[
              {
                key: "sku",
                header: "SKU",
                render: (r: Inventory) => (
                  <span className="font-mono text-xs">{r.skuCode}</span>
                ),
              },
              {
                key: "product",
                header: "Sản phẩm",
                render: (r: Inventory) => (
                  <span className="font-medium">{r.productName}</span>
                ),
              },
              {
                key: "variant",
                header: "Phiên bản",
                render: (r: Inventory) => (
                  <span className="text-admin-text-muted text-xs">
                    {r.color.name} · {r.size.name}
                  </span>
                ),
              },
              {
                key: "qty",
                header: "Tồn kho",
                align: "right",
                render: (r: Inventory) => (
                  <QuantityCell quantity={r.quantity} />
                ),
              },
              {
                key: "actions",
                header: "",
                width: "100px",
                align: "right",
                render: (r: Inventory) => (
                  <button
                    onClick={() => openEdit(r)}
                    className="text-primary-300 text-xs hover:underline"
                  >
                    Cập nhật
                  </button>
                ),
              },
            ]}
            data={inv.data?.content}
            loading={inv.isLoading}
            rowKey={(r) => r.inventoryId}
            emptyText="Chi nhánh này chưa có tồn kho. Thêm variant cho sản phẩm và set quantity."
          />

          <Pagination
            page={page}
            totalPages={inv.data?.totalPages ?? 1}
            onPageChange={setPage}
            className="mt-6"
          />
        </>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `Cập nhật tồn kho: ${editing.skuCode}` : ""}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setEditing(null)}
              disabled={update.isPending}
            >
              Huỷ
            </Button>
            <Button onClick={() => update.mutate()} loading={update.isPending}>
              Cập nhật
            </Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="space-y-1 text-sm">
              <p className="text-stone-600">
                <strong>{editing.productName}</strong>
              </p>
              <p className="text-stone-500">
                {editing.color.name} · {editing.size.name}
              </p>
            </div>
            <Input
              label="Số lượng tồn kho"
              type="number"
              min={0}
              value={qty}
              onChange={(e) => setQty(Math.max(0, Number(e.target.value)))}
              hint="Nhập số tuyệt đối — sẽ ghi đè số hiện tại."
            />
          </div>
        )}
      </Modal>
    </>
  );
}

function QuantityCell({ quantity }: Readonly<{ quantity: number }>) {
  let cls: string;
  if (quantity <= 2) cls = "text-red-400";
  else if (quantity <= 5) cls = "text-amber-400";
  else cls = "text-emerald-400";

  return <span className={`font-mono font-medium ${cls}`}>{quantity}</span>;
}
