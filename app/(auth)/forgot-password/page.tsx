"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation/auth";

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: (_, email) => {
      setSubmittedEmail(email);
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code, "Không gửi được email reset"), "error");
    },
  });

  if (submittedEmail) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="text-primary-600 mx-auto" size={48} />
        <h1 className="font-display mt-4 text-2xl font-extrabold text-stone-900">
          Đã gửi email
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          Nếu địa chỉ <strong className="text-stone-900">{submittedEmail}</strong>{" "}
          tồn tại trong hệ thống, bạn sẽ nhận được email với hướng dẫn đặt lại
          mật khẩu trong vài phút tới.
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button variant="secondary">Quay lại đăng nhập</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="font-display mb-2 text-3xl font-extrabold text-stone-900">
        Quên mật khẩu
      </h1>
      <p className="mb-7 text-sm text-stone-500">
        Nhập email tài khoản, chúng tôi sẽ gửi link đặt lại mật khẩu.
      </p>

      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v.email))}
        className="space-y-4"
      >
        <Input
          label="Email"
          type="email"
          required
          error={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          className="w-full"
          uppercase
          loading={mutation.isPending}
        >
          Gửi link đặt lại
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        <Link
          href="/login"
          className="text-primary-700 font-medium hover:underline"
        >
          ← Quay lại đăng nhập
        </Link>
      </p>
    </div>
  );
}
