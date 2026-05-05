"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { accountsApi } from "@/lib/api/accounts";
import { ApiException } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validation/account";

export default function ChangePasswordPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const change = useMutation({
    mutationFn: (values: ChangePasswordInput) =>
      accountsApi.changePassword(values.oldPassword, values.newPassword),
    onSuccess: () => {
      toast("Đổi mật khẩu thành công", "success");
      reset();
    },
    onError: (err) => {
      const code = err instanceof ApiException ? err.code : null;
      toast(getErrorMessage(code, "Không đổi được mật khẩu"), "error");
    },
  });

  return (
    <div>
      <h1 className="font-display mb-6 text-3xl font-extrabold tracking-tight text-stone-900">
        Đổi mật khẩu
      </h1>

      <form
        onSubmit={handleSubmit((v) => change.mutate(v))}
        className="space-y-5 rounded-xl border border-stone-200 bg-white p-6"
      >
        <Input
          label="Mật khẩu hiện tại"
          type="password"
          required
          error={errors.oldPassword?.message}
          {...register("oldPassword")}
        />
        <Input
          label="Mật khẩu mới"
          type="password"
          required
          hint="Tối thiểu 8 ký tự"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        <Input
          label="Xác nhận mật khẩu mới"
          type="password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="flex justify-end">
          <Button type="submit" uppercase loading={change.isPending}>
            Cập nhật
          </Button>
        </div>
      </form>
    </div>
  );
}
