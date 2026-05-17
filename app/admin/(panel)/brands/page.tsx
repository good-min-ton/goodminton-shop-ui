"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/storefront/pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { brandsApi } from "@/lib/api/brands";
import { searchApi } from "@/lib/api/search";
import { useBrands } from "@/hooks/use-catalog";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import type { Brand } from "@/types/api";

const brandSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(80),
});
type FormInput = z.infer<typeof brandSchema>;

export default function AdminBrandsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQ = useDebouncedValue(query.trim(), 300);
  const useSearch = debouncedQ.length >= 2;

  const list = useBrands({ enabled: !useSearch });
  const search = useQuery({
    queryKey: ["search", "brands", debouncedQ, page],
    queryFn: () => searchApi.brands({ q: debouncedQ, page, size: 20 }),
    enabled: useSearch,
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });

  const data = useSearch ? (search.data?.content ?? []) : (list.data ?? []);
  const loading = useSearch ? search.isLoading : list.isLoading;
  const totalPages = useSearch ? (search.data?.page.totalPages ?? 1) : 1;

  const [editing, setEditing] = useState<Brand | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Brand | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: "" },
  });

  function openCreate() {
    form.reset({ name: "" });
    setCreating(true);
  }

  function openEdit(row: Brand) {
    form.reset({ name: row.name });
    setEditing(row);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  const upsert = useMutation({
    mutationFn: (values: FormInput) =>
      editing
        ? brandsApi.update(editing.id, values)
        : brandsApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      toast(editing ? "Đã cập nhật" : "Đã tạo thương hiệu", "success");
      closeForm();
    },
    onError: (err) => {
      toast(getErrorMessage(err), "error");
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => brandsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
      toast("Đã xoá thương hiệu", "success");
      setDeleting(null);
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Không xoá được"), "error");
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Thương hiệu"
        actions={
          <Button variant="admin-primary" onClick={openCreate}>
            <Plus size={16} />
            Thêm thương hiệu
          </Button>
        }
      />

      <AdminSearchBar
        value={query}
        onChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        placeholder="Tìm thương hiệu theo tên..."
        className="mb-4"
      />

      <DataTable
        columns={[
          {
            key: "name",
            header: "Tên",
            render: (r: Brand) => <span className="font-medium">{r.name}</span>,
          },
          {
            key: "actions",
            header: "",
            width: "120px",
            align: "right",
            render: (r: Brand) => (
              <div className="inline-flex items-center gap-1">
                <button
                  onClick={() => openEdit(r)}
                  className="text-admin-text-muted hover:bg-admin-surface-2 hover:text-admin-text rounded-md p-1.5"
                  aria-label="Sửa"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleting(r)}
                  className="text-admin-text-muted rounded-md p-1.5 hover:bg-red-500/10 hover:text-red-400"
                  aria-label="Xoá"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          },
        ]}
        data={data}
        loading={loading}
        rowKey={(r) => r.id}
        emptyText={
          useSearch
            ? "Không tìm thấy thương hiệu phù hợp"
            : "Chưa có thương hiệu nào"
        }
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        admin
        className="mt-6"
      />

      <Modal
        open={creating || editing !== null}
        onClose={closeForm}
        title={editing ? "Sửa thương hiệu" : "Thêm thương hiệu"}
        theme="dark"
        footer={
          <>
            <Button variant="admin-ghost" onClick={closeForm} disabled={upsert.isPending}>
              Huỷ
            </Button>
            <Button
              type="submit"
              form="brand-form"
              variant="admin-primary"
              loading={upsert.isPending}
            >
              {editing ? "Cập nhật" : "Tạo"}
            </Button>
          </>
        }
      >
        <form
          id="brand-form"
          onSubmit={form.handleSubmit((v) => upsert.mutate(v))}
          className="space-y-4"
        >
          <Input
            label="Tên thương hiệu"
            admin
            required
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Xoá thương hiệu?"
        description={`Bạn có chắc muốn xoá "${deleting?.name}"?`}
        confirmLabel="Xoá"
        destructive
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </>
  );
}
