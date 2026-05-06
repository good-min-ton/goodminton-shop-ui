"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useCurrentUser } from "@/hooks/use-auth";
import { accountsApi } from "@/lib/api/accounts";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import { profileSchema, type ProfileInput } from "@/lib/validation/account";

export default function AccountProfilePage() {
  const me = useCurrentUser();
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", phone: "" },
  });

  useEffect(() => {
    if (me.data) reset({ fullName: me.data.fullName, phone: me.data.phone });
  }, [me.data, reset]);

  const update = useMutation({
    mutationFn: (values: ProfileInput) => accountsApi.updateMyInfo(values),
    onSuccess: (updated) => {
      setUser(updated);
      qc.setQueryData(["accounts", "me"], updated);
      reset({ fullName: updated.fullName, phone: updated.phone });
      toast("Đã cập nhật hồ sơ", "success");
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Không cập nhật được hồ sơ"), "error");
    },
  });

  return (
    <div>
      <h1 className="font-display mb-6 text-3xl font-extrabold tracking-tight text-stone-900">
        Hồ sơ
      </h1>

      <form
        onSubmit={handleSubmit((v) => update.mutate(v))}
        className="space-y-5 rounded-xl border border-stone-200 bg-white p-6"
      >
        <Input
          label="Email"
          value={me.data?.email ?? ""}
          readOnly
          hint="Không thể đổi email. Liên hệ hỗ trợ nếu cần."
        />
        <Input
          label="Họ và tên"
          required
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          label="Số điện thoại"
          type="tel"
          required
          error={errors.phone?.message}
          {...register("phone")}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            uppercase
            disabled={!isDirty}
            loading={update.isPending}
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
}
