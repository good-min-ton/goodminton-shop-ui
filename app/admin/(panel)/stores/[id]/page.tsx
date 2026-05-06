"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, UserCog } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { storesApi } from "@/lib/api/stores";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import { formatDateTime } from "@/lib/utils";

export default function AdminStoreDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number(params.id) : null;
  const router = useRouter();
  const qc = useQueryClient();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [pickedAdminId, setPickedAdminId] = useState<number | "">("");

  const store = useQuery({
    queryKey: ["stores", "detail", id],
    queryFn: () => storesApi.detail(id as number),
    enabled: id != null,
  });

  const availableAdmins = useQuery({
    queryKey: ["stores", "available-admins"],
    queryFn: () => storesApi.availableAdmins(),
    enabled: reassignOpen,
  });

  const reassign = useMutation({
    mutationFn: (adminId: number) =>
      storesApi.updateAdmin(id as number, adminId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stores"] });
      toast("Đã cập nhật quản lý chi nhánh", "success");
      setReassignOpen(false);
      setPickedAdminId("");
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code), "error");
    },
  });

  const remove = useMutation({
    mutationFn: () => storesApi.remove(id as number),
    onSuccess: () => {
      toast("Đã xoá chi nhánh", "success");
      router.replace("/admin/stores");
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(
        getErrorMessage(code, "Không xoá được — chi nhánh có thể còn inventory"),
        "error",
      );
    },
  });

  if (store.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="text-primary-300" size={32} />
      </div>
    );
  }

  if (!store.data) {
    return <EmptyState title="Không tìm thấy chi nhánh" />;
  }

  const s = store.data;

  return (
    <>
      <AdminPageHeader
        title={s.name}
        breadcrumbs={[
          { label: "Chi nhánh", href: "/admin/stores" },
          { label: `#${s.storeId}` },
        ]}
        actions={
          <>
            <Button
              variant="admin-ghost"
              onClick={() => setReassignOpen(true)}
            >
              <UserCog size={16} />
              Đổi quản lý
            </Button>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={16} />
              Xoá
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <AdminCard>
          <h2 className="font-display text-admin-text-muted mb-4 text-[11px] font-bold tracking-widest uppercase">
            Thông tin
          </h2>
          <dl className="space-y-3 text-sm">
            <Row label="ID">
              <span className="font-mono">#{s.storeId}</span>
            </Row>
            <Row label="Tên">{s.name}</Row>
            <Row label="Địa chỉ">{s.address}</Row>
            <Row label="Liên hệ">
              <span className="font-mono">{s.contact}</span>
            </Row>
            <Row label="Toạ độ">
              <span className="font-mono text-xs">
                {s.latitude.toFixed(6)}, {s.longitude.toFixed(6)}
              </span>
            </Row>
            <Row label="Tạo lúc">
              <span className="font-mono text-xs">
                {formatDateTime(s.createdAt)}
              </span>
            </Row>
          </dl>
        </AdminCard>

        <AdminCard>
          <h2 className="font-display text-admin-text-muted mb-4 text-[11px] font-bold tracking-widest uppercase">
            Quản lý chi nhánh
          </h2>
          {s.admin ? (
            <dl className="space-y-3 text-sm">
              <Row label="Họ tên">{s.admin.fullName}</Row>
              <Row label="Email">{s.admin.email}</Row>
              <Row label="Điện thoại">
                <span className="font-mono">{s.admin.phone}</span>
              </Row>
              <Row label="ID">
                <span className="font-mono">#{s.admin.accountId}</span>
              </Row>
            </dl>
          ) : (
            <p className="text-admin-text-muted text-sm italic">
              Chưa gán quản lý.
            </p>
          )}
        </AdminCard>
      </div>

      <Modal
        open={reassignOpen}
        onClose={() => {
          setReassignOpen(false);
          setPickedAdminId("");
        }}
        title="Đổi quản lý chi nhánh"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setReassignOpen(false)}
              disabled={reassign.isPending}
            >
              Huỷ
            </Button>
            <Button
              loading={reassign.isPending}
              disabled={!pickedAdminId}
              onClick={() =>
                pickedAdminId && reassign.mutate(Number(pickedAdminId))
              }
            >
              Cập nhật
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-stone-600">
          Chọn store admin mới (chỉ hiển thị admin chưa gán chi nhánh nào).
        </p>
        {availableAdmins.isLoading ? (
          <Spinner />
        ) : !availableAdmins.data || availableAdmins.data.length === 0 ? (
          <p className="text-sm text-amber-600">
            Không còn store admin nào trống.
          </p>
        ) : (
          <select
            value={pickedAdminId}
            onChange={(e) => setPickedAdminId(Number(e.target.value))}
            className="w-full rounded-lg border-[1.5px] border-stone-200 bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-primary-700"
          >
            <option value="" disabled>
              -- Chọn admin --
            </option>
            {availableAdmins.data.map((a) => (
              <option key={a.accountId} value={a.accountId}>
                {a.fullName} · {a.email}
              </option>
            ))}
          </select>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Xoá chi nhánh?"
        description={`Bạn có chắc muốn xoá "${s.name}"? Chỉ xoá được khi chi nhánh chưa có inventory.`}
        confirmLabel="Xoá"
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </>
  );
}

interface RowProps {
  label: string;
  children: React.ReactNode;
}

function Row({ label, children }: Readonly<RowProps>) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="text-admin-text-muted w-24 flex-shrink-0 text-xs">
        {label}
      </dt>
      <dd className="text-admin-text">{children}</dd>
    </div>
  );
}
