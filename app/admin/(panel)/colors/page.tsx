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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { colorsApi } from "@/lib/api/colors-sizes";
import { useColors } from "@/hooks/use-catalog";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import type { Color } from "@/types/api";

const colorSchema = z.object({
  name: z.string().min(1, "Tên không được trống").max(40),
});
type FormInput = z.infer<typeof colorSchema>;

export default function AdminColorsPage() {
  const qc = useQueryClient();
  const list = useColors();
  const [editing, setEditing] = useState<Color | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Color | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(colorSchema),
    defaultValues: { name: "" },
  });

  function openCreate() {
    form.reset({ name: "" });
    setCreating(true);
  }

  function openEdit(row: Color) {
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
        ? colorsApi.update(editing.colorId, values)
        : colorsApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["colors"] });
      toast(editing ? "Đã cập nhật" : "Đã thêm màu", "success");
      closeForm();
    },
    onError: (err) => {
      toast(getErrorMessage(err), "error");
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => colorsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["colors"] });
      toast("Đã xoá màu", "success");
      setDeleting(null);
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Không xoá được"), "error");
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Màu sắc"
        description="Bảng màu áp dụng cho các phiên bản sản phẩm."
        actions={
          <Button variant="admin-primary" onClick={openCreate}>
            <Plus size={16} />
            Thêm màu
          </Button>
        }
      />

      <DataTable
        columns={[
          {
            key: "name",
            header: "Tên màu",
            render: (r: Color) => <span className="font-medium">{r.name}</span>,
          },
          {
            key: "actions",
            header: "",
            width: "120px",
            align: "right",
            render: (r: Color) => (
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
        rowKey={(r) => r.colorId}
      />

      <Modal
        open={creating || editing !== null}
        onClose={closeForm}
        title={editing ? "Sửa màu" : "Thêm màu"}
        theme="dark"
        footer={
          <>
            <Button variant="admin-ghost" onClick={closeForm} disabled={upsert.isPending}>
              Huỷ
            </Button>
            <Button
              type="submit"
              form="color-form"
              variant="admin-primary"
              loading={upsert.isPending}
            >
              {editing ? "Cập nhật" : "Tạo"}
            </Button>
          </>
        }
      >
        <form
          id="color-form"
          onSubmit={form.handleSubmit((v) => upsert.mutate(v))}
          className="space-y-4"
        >
          <Input
            label="Tên màu"
            admin
            placeholder="VD: Đỏ, Xanh navy, Trắng..."
            required
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Xoá màu?"
        description={`Bạn có chắc muốn xoá "${deleting?.name}"?`}
        confirmLabel="Xoá"
        destructive
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.colorId)}
      />
    </>
  );
}
