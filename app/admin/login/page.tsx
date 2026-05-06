"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/storefront/logo";
import { Button } from "@/components/ui/button";
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
            <div className="flex flex-col gap-1.5">
              <label className="text-admin-text-muted text-sm font-medium">
                Email hoặc số điện thoại{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                autoComplete="username"
                className="border-admin-border bg-admin-bg text-admin-text placeholder:text-admin-text-muted focus:border-primary-400 w-full rounded-lg border px-3.5 py-2.5 text-[15px] outline-none transition-colors"
                {...register("identifier")}
              />
              {errors.identifier && (
                <span className="text-[13px] text-red-400">
                  {errors.identifier.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-admin-text-muted text-sm font-medium">
                Mật khẩu <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                autoComplete="current-password"
                className="border-admin-border bg-admin-bg text-admin-text placeholder:text-admin-text-muted focus:border-primary-400 w-full rounded-lg border px-3.5 py-2.5 text-[15px] outline-none transition-colors"
                {...register("password")}
              />
              {errors.password && (
                <span className="text-[13px] text-red-400">
                  {errors.password.message}
                </span>
              )}
            </div>

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
