"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSearchBar } from "@/components/admin/admin-search-bar";
import { DataTable } from "@/components/admin/data-table";
import { Pagination } from "@/components/storefront/pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categoriesApi } from "@/lib/api/categories";
import { searchApi } from "@/lib/api/search";
import { useCategories } from "@/hooks/use-catalog";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import type { Category } from "@/types/api";

const categorySchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(80),
  description: z.string().max(255).optional(),
});
type FormInput = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQ = useDebouncedValue(query.trim(), 300);
  const useSearch = debouncedQ.length >= 2;

  const list = useCategories({ enabled: !useSearch });
  const search = useQuery({
    queryKey: ["search", "categories", debouncedQ, page],
    queryFn: () => searchApi.categories({ q: debouncedQ, page, size: 20 }),
    enabled: useSearch,
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });

  const data = useSearch ? (search.data?.content ?? []) : (list.data ?? []);
  const loading = useSearch ? search.isLoading : list.isLoading;
  const totalPages = useSearch ? (search.data?.page.totalPages ?? 1) : 1;

  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  // Free object URLs we created from picked files; remote URLs are owned by
  // the server and don't need revocation.
  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  function resetThumbnail(remoteUrl?: string | null) {
    setThumbnail(null);
    setThumbnailPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return remoteUrl ?? null;
    });
  }

  function onPickThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setThumbnail(file);
    setThumbnailPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function openCreate() {
    form.reset({ name: "", description: "" });
    resetThumbnail(null);
    setCreating(true);
  }

  function openEdit(row: Category) {
    form.reset({ name: row.name, description: row.description ?? "" });
    resetThumbnail(row.thumbnail?.url ?? null);
    setEditing(row);
  }

  function closeForm() {
    form.reset({ name: "", description: "" });
    resetThumbnail(null);
    setCreating(false);
    setEditing(null);
  }

  const upsert = useMutation({
    mutationFn: async (values: FormInput) => {
      const body = { name: values.name, description: values.description };
      if (editing) {
        return categoriesApi.update(editing.id, body, thumbnail);
      }
      return categoriesApi.create(body, thumbnail);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast(editing ? "Đã cập nhật danh mục" : "Đã tạo danh mục", "success");
      closeForm();
    },
    onError: (err) => {
      toast(getErrorMessage(err), "error");
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => categoriesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast("Đã xoá danh mục", "success");
      setDeleting(null);
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Không xoá được — danh mục có thể đang được sử dụng"), "error");
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Danh mục"
        description="Phân loại sản phẩm theo nhóm chính."
        actions={
          <Button variant="admin-primary" onClick={openCreate}>
            <Plus size={16} />
            Thêm danh mục
          </Button>
        }
      />

      <AdminSearchBar
        value={query}
        onChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        placeholder="Tìm danh mục theo tên..."
        className="mb-4"
      />

      <DataTable
        columns={[
          {
            key: "name",
            header: "Tên",
            render: (r: Category) => (
              <span className="font-medium">{r.name}</span>
            ),
          },
          {
            key: "description",
            header: "Mô tả",
            render: (r: Category) => (
              <span className="text-admin-text-muted">
                {r.description || "—"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            width: "120px",
            align: "right",
            render: (r: Category) => (
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
            ? "Không tìm thấy danh mục phù hợp"
            : "Chưa có danh mục nào"
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
        title={editing ? "Sửa danh mục" : "Thêm danh mục"}
        theme="dark"
        footer={
          <>
            <Button
              variant="admin-ghost"
              onClick={closeForm}
              disabled={upsert.isPending}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              form="category-form"
              variant="admin-primary"
              loading={upsert.isPending}
            >
              {editing ? "Cập nhật" : "Tạo"}
            </Button>
          </>
        }
      >
        <form
          id="category-form"
          onSubmit={form.handleSubmit((v) => upsert.mutate(v))}
          className="space-y-4"
        >
          <Input
            label="Tên danh mục"
            admin
            required
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <Textarea
            label="Mô tả"
            admin
            rows={3}
            error={form.formState.errors.description?.message}
            {...form.register("description")}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-200">
              Ảnh đại diện
            </span>
            <div className="flex items-start gap-4">
              <div className="bg-admin-surface-2 flex h-24 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg">
                {thumbnailPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon size={28} className="text-admin-text-muted" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPickThumbnail}
                  className="text-admin-text-muted file:bg-admin-surface-2 file:border-admin-border file:text-admin-text hover:file:bg-admin-surface-2/80 block w-full text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:text-sm"
                />
                <p className="text-admin-text-muted mt-2 text-xs leading-relaxed">
                  Tỉ lệ 4:3, ≥ 1200×900px. Hiển thị làm nền card danh mục — chừa
                  vùng góc dưới-trái cho text overlay. Optional khi sửa, bỏ trống
                  để giữ ảnh cũ.
                </p>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Xoá danh mục?"
        description={`Bạn có chắc muốn xoá "${deleting?.name}"? Chỉ xoá được khi không còn sản phẩm thuộc danh mục này.`}
        confirmLabel="Xoá"
        destructive
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
      />
    </>
  );
}
