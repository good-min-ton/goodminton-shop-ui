"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { accountsApi } from "@/lib/api/accounts";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";

export default function CreateStoreAdminPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const create = useMutation({
    mutationFn: (values: RegisterInput) =>
      accountsApi.createStoreAdmin({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
      }),
    onSuccess: (acc) => {
      toast(`Đã tạo tài khoản ${acc.email}`, "success");
      router.replace("/admin/accounts");
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code, "Không tạo được tài khoản"), "error");
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Tạo Store Admin"
        description="Tạo tài khoản mới với vai trò quản lý chi nhánh."
        breadcrumbs={[
          { label: "Tài khoản", href: "/admin/accounts" },
          { label: "Tạo Store Admin" },
        ]}
      />

      <AdminCard className="max-w-xl">
        <form
          onSubmit={handleSubmit((v) => create.mutate(v))}
          className="space-y-4"
        >
          <Input
            label="Họ và tên"
            required
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <Input
            label="Email"
            type="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Số điện thoại"
            type="tel"
            required
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Mật khẩu tạm"
            type="password"
            required
            hint="Tối thiểu 8 ký tự — yêu cầu store admin đổi sau khi đăng nhập."
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Huỷ
            </Button>
            <Button type="submit" loading={create.isPending}>
              Tạo tài khoản
            </Button>
          </div>
        </form>
      </AdminCard>
    </>
  );
}
