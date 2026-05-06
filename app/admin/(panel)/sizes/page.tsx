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
import { sizesApi } from "@/lib/api/colors-sizes";
import { useSizes } from "@/hooks/use-catalog";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import type { SizeOption, SizeType } from "@/types/api";

const sizeSchema = z.object({
  name: z.string().min(1, "Tên không được trống").max(40),
  type: z.enum(["RACKET", "NON_RACKET"]),
});
type FormInput = z.infer<typeof sizeSchema>;

const TYPE_LABEL: Record<SizeType, string> = {
  RACKET: "Vợt",
  NON_RACKET: "Khác",
};

export default function AdminSizesPage() {
  const qc = useQueryClient();
  const list = useSizes();
  const [editing, setEditing] = useState<SizeOption | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<SizeOption | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(sizeSchema),
    defaultValues: { name: "", type: "RACKET" },
  });

  function openCreate() {
    form.reset({ name: "", type: "RACKET" });
    setCreating(true);
  }

  function openEdit(row: SizeOption) {
    form.reset({ name: row.name, type: row.type });
    setEditing(row);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  const upsert = useMutation({
    mutationFn: (values: FormInput) =>
      editing ? sizesApi.update(editing.sizeId, values) : sizesApi.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sizes"] });
      toast(editing ? "Đã cập nhật" : "Đã thêm cỡ", "success");
      closeForm();
    },
    onError: (err) => {
      toast(getErrorMessage(err), "error");
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => sizesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sizes"] });
      toast("Đã xoá cỡ", "success");
      setDeleting(null);
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Không xoá được"), "error");
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Kích cỡ"
        description="Cỡ vợt (4U, 3U...) và cỡ phụ kiện."
        actions={
          <Button variant="admin-primary" onClick={openCreate}>
            <Plus size={16} />
            Thêm cỡ
          </Button>
        }
      />

      <DataTable
        columns={[
          {
            key: "id",
            header: "ID",
            width: "80px",
            render: (r: SizeOption) => (
              <span className="font-mono text-admin-text-muted">
                #{r.sizeId}
              </span>
            ),
          },
          {
            key: "name",
            header: "Tên",
            render: (r: SizeOption) => (
              <span className="font-mono font-medium">{r.name}</span>
            ),
          },
          {
            key: "type",
            header: "Loại",
            render: (r: SizeOption) => (
              <span className="bg-admin-surface-2 text-admin-text-muted inline-flex rounded-md px-2 py-0.5 text-xs">
                {TYPE_LABEL[r.type]}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            width: "120px",
            align: "right",
            render: (r: SizeOption) => (
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
        rowKey={(r) => r.sizeId}
      />

      <Modal
        open={creating || editing !== null}
        onClose={closeForm}
        title={editing ? "Sửa cỡ" : "Thêm cỡ"}
        footer={
          <>
            <Button variant="secondary" onClick={closeForm} disabled={upsert.isPending}>
              Huỷ
            </Button>
            <Button type="submit" form="size-form" loading={upsert.isPending}>
              {editing ? "Cập nhật" : "Tạo"}
            </Button>
          </>
        }
      >
        <form
          id="size-form"
          onSubmit={form.handleSubmit((v) => upsert.mutate(v))}
          className="space-y-4"
        >
          <Input
            label="Tên"
            placeholder="VD: 4U, 3U, M, L..."
            required
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">
              Loại <span className="text-red-400">*</span>
            </label>
            <select
              {...form.register("type")}
              className="rounded-lg border-[1.5px] border-stone-200 bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-primary-700"
            >
              <option value="RACKET">Vợt cầu lông</option>
              <option value="NON_RACKET">Phụ kiện / quần áo / giày</option>
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Xoá cỡ?"
        description={`Bạn có chắc muốn xoá "${deleting?.name}"?`}
        confirmLabel="Xoá"
        destructive
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.sizeId)}
      />
    </>
  );
}
