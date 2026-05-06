"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { categoriesApi } from "@/lib/api/categories";
import { useCategories } from "@/hooks/use-catalog";
import { ApiException } from "@/lib/api";
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
  const list = useCategories();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  function openCreate() {
    form.reset({ name: "", description: "" });
    setCreating(true);
  }

  function openEdit(row: Category) {
    form.reset({ name: row.name, description: row.description ?? "" });
    setEditing(row);
  }

  function closeForm() {
    form.reset({ name: "", description: "" });
    setCreating(false);
    setEditing(null);
  }

  const upsert = useMutation({
    mutationFn: async (values: FormInput) => {
      if (editing) {
        return categoriesApi.update(editing.id, {
          name: values.name,
          description: values.description,
        });
      }
      return categoriesApi.create({
        name: values.name,
        description: values.description,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast(editing ? "Đã cập nhật danh mục" : "Đã tạo danh mục", "success");
      closeForm();
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code), "error");
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
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code, "Không xoá được — danh mục có thể đang được sử dụng"), "error");
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

      <DataTable
        columns={[
          {
            key: "id",
            header: "ID",
            width: "80px",
            render: (r: Category) => (
              <span className="font-mono text-admin-text-muted">#{r.id}</span>
            ),
          },
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
        data={list.data}
        loading={list.isLoading}
        rowKey={(r) => r.id}
      />

      <Modal
        open={creating || editing !== null}
        onClose={closeForm}
        title={editing ? "Sửa danh mục" : "Thêm danh mục"}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeForm}
              disabled={upsert.isPending}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              form="category-form"
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
            required
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <Textarea
            label="Mô tả"
            rows={3}
            error={form.formState.errors.description?.message}
            {...form.register("description")}
          />
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
