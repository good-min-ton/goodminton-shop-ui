"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed";
import { useLogin } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

function LoginForm() {
  const sp = useSearchParams();
  const next = sp.get("next") || undefined;
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    login.mutate({ ...values, redirectTo: next });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email hoặc số điện thoại"
        required
        error={errors.identifier?.message}
        {...register("identifier")}
      />
      <Input
        label="Mật khẩu"
        type="password"
        required
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-end pt-1">
        <Link
          href="/forgot-password"
          className="text-primary-700 text-sm font-medium hover:underline"
        >
          Quên mật khẩu?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full"
        uppercase
        loading={login.isPending}
      >
        Đăng nhập
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <RedirectIfAuthed>
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="font-display mb-2 text-3xl font-extrabold text-stone-900">
          Đăng nhập
        </h1>
        <p className="mb-7 text-sm text-stone-500">
          Chào mừng trở lại Goodminton.
        </p>

        <Suspense
          fallback={
            <div className="flex justify-center py-6">
              <Spinner className="text-primary-700" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-stone-500">
          <span>Chưa có tài khoản?</span>{" "}
          <Link
            href="/register"
            className="text-primary-700 font-medium hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </RedirectIfAuthed>
  );
}
