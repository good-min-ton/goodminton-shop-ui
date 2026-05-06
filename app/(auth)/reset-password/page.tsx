"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authApi } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validation/auth";

function ResetPasswordContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const mutation = useMutation({
    mutationFn: (newPassword: string) => {
      if (!token) throw new Error("Missing reset token");
      return authApi.resetPassword(token, newPassword);
    },
    onSuccess: () => {
      toast("Đặt lại mật khẩu thành công, hãy đăng nhập lại.", "success");
      router.replace("/login");
    },
    onError: (err) => {
      toast(
        getErrorMessage(err, "Không đặt lại được mật khẩu, link có thể đã hết hạn"),
        "error",
      );
    },
  });

  if (!token) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="font-display mb-2 text-2xl font-extrabold text-stone-900">
          Link không hợp lệ
        </h1>
        <p className="text-sm text-stone-500">
          Vui lòng yêu cầu lại email reset mật khẩu để nhận link mới.
        </p>
        <Link href="/forgot-password" className="mt-4 inline-block">
          <Button variant="secondary">Yêu cầu lại</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="font-display mb-2 text-3xl font-extrabold text-stone-900">
        Đặt lại mật khẩu
      </h1>
      <p className="mb-7 text-sm text-stone-500">
        Nhập mật khẩu mới để hoàn tất.
      </p>

      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v.newPassword))}
        className="space-y-4"
      >
        <Input
          label="Mật khẩu mới"
          type="password"
          required
          hint="Tối thiểu 8 ký tự"
          error={errors.newPassword?.message}
          {...register("newPassword")}
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
          loading={mutation.isPending}
        >
          Cập nhật mật khẩu
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner className="text-primary-700" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
