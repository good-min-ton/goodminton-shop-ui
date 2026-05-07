"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lock, Unlock } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { accountsApi } from "@/lib/api/accounts";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import { formatDateTime } from "@/lib/utils";
import type { AccountStatus, Role } from "@/types/api";

const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: "Khách hàng",
  STORE_ADMIN: "Quản lý chi nhánh",
  SUPER_ADMIN: "Super Admin",
};

export default function AdminAccountDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number(params.id) : null;
  const qc = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const account = useQuery({
    queryKey: ["accounts", "detail", id],
    queryFn: () => accountsApi.detail(id as number),
    enabled: id != null,
  });

  const setStatus = useMutation({
    mutationFn: (status: AccountStatus) =>
      accountsApi.setStatus(id as number, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["stores", "available-admins"] });
      toast("Đã cập nhật trạng thái", "success");
      setConfirmOpen(false);
    },
    onError: (err) => {
      toast(getErrorMessage(err), "error");
    },
  });

  if (account.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="text-primary-300" size={32} />
      </div>
    );
  }

  if (!account.data) {
    return (
      <EmptyState
        title="Không tìm thấy tài khoản"
        action={
          <Button variant="secondary" onClick={() => account.refetch()}>
            Tải lại
          </Button>
        }
      />
    );
  }

  const a = account.data;
  const isActive = a.status === "ACTIVE";

  return (
    <>
      <AdminPageHeader
        title={a.fullName}
        breadcrumbs={[
          { label: "Tài khoản", href: "/admin/accounts" },
          { label: `#${a.accountId}` },
        ]}
        actions={
          <Button
            variant={isActive ? "danger" : "admin-primary"}
            onClick={() => setConfirmOpen(true)}
          >
            {isActive ? (
              <>
                <Lock size={16} />
                Khoá tài khoản
              </>
            ) : (
              <>
                <Unlock size={16} />
                Mở khoá
              </>
            )}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <AdminCard>
          <h2 className="font-display text-admin-text-muted mb-4 text-[11px] font-bold tracking-widest uppercase">
            Thông tin chung
          </h2>
          <dl className="space-y-3 text-sm">
            <Row label="ID">
              <span className="font-mono">#{a.accountId}</span>
            </Row>
            <Row label="Họ tên">{a.fullName}</Row>
            <Row label="Email">{a.email}</Row>
            <Row label="Số điện thoại">
              <span className="font-mono">{a.phone}</span>
            </Row>
          </dl>
        </AdminCard>

        <AdminCard>
          <h2 className="font-display text-admin-text-muted mb-4 text-[11px] font-bold tracking-widest uppercase">
            Quyền & trạng thái
          </h2>
          <dl className="space-y-3 text-sm">
            <Row label="Vai trò">{ROLE_LABEL[a.role]}</Row>
            <Row label="Trạng thái">
              {isActive ? (
                <span className="text-emerald-400">Đang hoạt động</span>
              ) : (
                <span className="text-red-400">Đã khoá</span>
              )}
            </Row>
            <Row label="Tạo lúc">
              <span className="font-mono text-xs">
                {formatDateTime(a.createdAt)}
              </span>
            </Row>
          </dl>
        </AdminCard>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={isActive ? "Khoá tài khoản?" : "Mở khoá tài khoản?"}
        description={
          isActive
            ? `Tài khoản ${a.email} sẽ không thể đăng nhập sau khi khoá.`
            : `Tài khoản ${a.email} sẽ có thể đăng nhập trở lại.`
        }
        confirmLabel={isActive ? "Khoá" : "Mở khoá"}
        destructive={isActive}
        loading={setStatus.isPending}
        onConfirm={() => setStatus.mutate(isActive ? "INACTIVE" : "ACTIVE")}
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
      <dt className="text-admin-text-muted w-32 flex-shrink-0 text-xs">
        {label}
      </dt>
      <dd className="text-admin-text">{children}</dd>
    </div>
  );
}
