"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/storefront/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed";
import { useAdminLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export default function AdminLoginPage() {
  return (
    <RedirectIfAuthed>
      <AdminLoginContent />
    </RedirectIfAuthed>
  );
}

function AdminLoginContent() {
  const login = useAdminLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  return (
    <div className="bg-soft-glow-dark flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" variant="card" />
          <p className="font-mono text-admin-text-muted mt-3 text-[11px] tracking-widest uppercase">
            Goodminton · Trang quản trị
          </p>
        </div>

        <div className="bg-admin-surface border-admin-border rounded-2xl border p-8">
          <div className="mb-6 flex items-center gap-2.5">
            <div className="bg-primary-400/10 text-primary-300 flex h-9 w-9 items-center justify-center rounded-lg">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h1 className="font-display text-admin-text text-xl font-bold tracking-tight">
                Đăng nhập quản trị
              </h1>
              <p className="text-admin-text-muted text-xs">
                Dành cho Super Admin và Store Admin.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit((v) => login.mutate(v))}
            className="space-y-4"
          >
            {/* Dùng Input chung thay vì input thô: nút hiện/ẩn mật khẩu nằm
                trong đó, và nhãn được nối với ô qua htmlFor - trước đây nhãn
                không có htmlFor nên bấm vào chữ không focus được vào ô. Giữ
                bg-admin-bg để nền không đổi so với thiết kế cũ. */}
            <Input
              label="Email hoặc số điện thoại"
              required
              type="text"
              autoComplete="username"
              admin
              className="bg-admin-bg"
              error={errors.identifier?.message}
              {...register("identifier")}
            />

            <Input
              label="Mật khẩu"
              required
              type="password"
              autoComplete="current-password"
              admin
              className="bg-admin-bg"
              error={errors.password?.message}
              {...register("password")}
            />

            <Button
              type="submit"
              variant="admin-primary"
              uppercase
              className="w-full"
              size="lg"
              loading={login.isPending}
            >
              Đăng nhập
            </Button>
          </form>

          <p className="text-admin-text-muted mt-6 text-center text-xs">
            Bạn là khách hàng?{" "}
            <Link
              href="/login"
              className="text-primary-300 hover:underline"
            >
              Đăng nhập tại đây
            </Link>
          </p>
        </div>

        <p className="text-admin-text-muted mt-6 text-center text-[11px]">
          Tài khoản admin được tạo bởi quản trị viên hệ thống. Liên hệ Super
          Admin nếu cần cấp tài khoản.
        </p>
      </div>
    </div>
  );
}
