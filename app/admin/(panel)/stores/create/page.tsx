"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { storesApi } from "@/lib/api/stores";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";

const storeSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(120),
  address: z.string().min(8, "Vui lòng nhập địa chỉ đầy đủ").max(255),
  contact: z.string().min(8, "Số điện thoại không hợp lệ").max(20),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  adminId: z.number().int().positive("Vui lòng chọn quản lý"),
});
type FormInput = z.infer<typeof storeSchema>;

export default function CreateStorePage() {
  const router = useRouter();

  const availableAdmins = useQuery({
    queryKey: ["stores", "available-admins"],
    queryFn: () => storesApi.availableAdmins(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      address: "",
      contact: "",
      longitude: 0,
      latitude: 0,
      adminId: 0,
    },
  });

  const create = useMutation({
    mutationFn: (values: FormInput) => storesApi.create(values),
    onSuccess: (s) => {
      toast(`Đã tạo chi nhánh ${s.name}`, "success");
      router.replace("/admin/stores");
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Không tạo được chi nhánh"), "error");
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Tạo chi nhánh"
        breadcrumbs={[
          { label: "Chi nhánh", href: "/admin/stores" },
          { label: "Tạo mới" },
        ]}
      />

      <AdminCard className="max-w-2xl">
        <form
          onSubmit={handleSubmit((v) => create.mutate(v))}
          className="space-y-4"
        >
          <Input
            label="Tên chi nhánh"
            required
            error={errors.name?.message}
            {...register("name")}
          />
          <Textarea
            label="Địa chỉ"
            required
            rows={2}
            error={errors.address?.message}
            {...register("address")}
          />
          <Input
            label="Số liên hệ"
            type="tel"
            required
            error={errors.contact?.message}
            {...register("contact")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Kinh độ (longitude)"
              type="number"
              step="0.000001"
              required
              error={errors.longitude?.message}
              {...register("longitude", { valueAsNumber: true })}
            />
            <Input
              label="Vĩ độ (latitude)"
              type="number"
              step="0.000001"
              required
              error={errors.latitude?.message}
              {...register("latitude", { valueAsNumber: true })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">
              Quản lý chi nhánh <span className="text-red-400">*</span>
            </label>
            {availableAdmins.isLoading ? (
              <div className="py-2">
                <Spinner className="text-primary-300" size={20} />
              </div>
            ) : (
              <select
                {...register("adminId", { valueAsNumber: true })}
                className="rounded-lg border-[1.5px] border-stone-200 bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-primary-700"
                defaultValue=""
              >
                <option value="" disabled>
                  -- Chọn store admin --
                </option>
                {availableAdmins.data?.map((a) => (
                  <option key={a.accountId} value={a.accountId}>
                    {a.fullName} · {a.email}
                  </option>
                ))}
              </select>
            )}
            {errors.adminId && (
              <span className="text-[13px] text-red-400">
                {errors.adminId.message}
              </span>
            )}
            {availableAdmins.data?.length === 0 && (
              <span className="text-[13px] text-amber-400">
                Chưa có store admin nào trống. Tạo tài khoản Store Admin trước.
              </span>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Huỷ
            </Button>
            <Button type="submit" loading={create.isPending}>
              Tạo chi nhánh
            </Button>
          </div>
        </form>
      </AdminCard>
    </>
  );
}
