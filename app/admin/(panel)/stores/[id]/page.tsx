"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Star, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { storesApi } from "@/lib/api/stores";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import { formatDateTime } from "@/lib/utils";

export default function AdminStoreDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number(params.id) : 0;
  const router = useRouter();
  const qc = useQueryClient();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const store = useQuery({
    queryKey: ["stores", "detail", id],
    queryFn: () => storesApi.detail(id),
    enabled: id > 0,
  });

  const remove = useMutation({
    mutationFn: () => storesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stores"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast("Đã xoá chi nhánh", "success");
      router.replace("/admin/stores");
    },
    onError: (err) => {
      toast(
        getErrorMessage(err, "Không xoá được — chi nhánh có thể còn inventory"),
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
          { label: `#${s.id}` },
        ]}
        actions={
          <>
            {s.isCentral && <CentralBadge />}
            <Link href={`/admin/stores/${s.id}/edit`}>
              <Button variant="admin-ghost">
                <Pencil size={16} />
                Chỉnh sửa
              </Button>
            </Link>
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
              <span className="font-mono">#{s.id}</span>
            </Row>
            <Row label="Tên">{s.name}</Row>
            <Row label="Loại">
              {s.isCentral ? (
                <CentralBadge />
              ) : (
                <span className="text-admin-text-muted">Chi nhánh thường</span>
              )}
            </Row>
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
                <span className="font-mono">#{s.admin.id}</span>
              </Row>
            </dl>
          ) : (
            <p className="text-admin-text-muted text-sm italic">
              Chưa gán quản lý.
            </p>
          )}
        </AdminCard>
      </div>

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

function CentralBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-300">
      <Star size={11} className="fill-amber-300" />
      Trung tâm
    </span>
  );
}
