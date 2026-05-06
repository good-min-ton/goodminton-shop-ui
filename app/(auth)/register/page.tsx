"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RedirectIfAuthed } from "@/components/auth/redirect-if-authed";
import { useRegister } from "@/hooks/use-auth";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";

export default function RegisterPage() {
  return (
    <RedirectIfAuthed>
      <RegisterContent />
    </RedirectIfAuthed>
  );
}

function RegisterContent() {
  const registerMutation = useRegister();
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

  function onSubmit(values: RegisterInput) {
    registerMutation.mutate({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      password: values.password,
    });
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="font-display mb-2 text-3xl font-extrabold text-stone-900">
        Đăng ký
      </h1>
      <p className="mb-7 text-sm text-stone-500">Tạo tài khoản Goodminton.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="0901234567"
          required
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          label="Mật khẩu"
          type="password"
          required
          hint="Tối thiểu 8 ký tự"
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

        <Button
          type="submit"
          className="w-full"
          uppercase
          loading={registerMutation.isPending}
        >
          Tạo tài khoản
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        <span>Đã có tài khoản?</span>{" "}
        <Link
          href="/login"
          className="text-primary-700 font-medium hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
