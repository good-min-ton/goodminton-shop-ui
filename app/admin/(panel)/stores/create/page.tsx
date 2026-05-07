"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { AlertCircle, RefreshCw, UserPlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LocationPicker } from "@/components/map/location-picker";
import { storesApi } from "@/lib/api/stores";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";
import type { Account } from "@/types/api";

const storeSchema = z
  .object({
    name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(120),
    address: z.string().min(8, "Vui lòng nhập địa chỉ đầy đủ").max(255),
    contact: z.string().min(8, "Số điện thoại không hợp lệ").max(20),
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
    adminId: z.number().int().positive("Vui lòng chọn quản lý"),
  })
  .refine((v) => !(v.latitude === 0 && v.longitude === 0), {
    path: ["latitude"],
    message: "Vui lòng chọn vị trí cửa hàng trên bản đồ",
  });
type FormInput = z.infer<typeof storeSchema>;

export default function CreateStorePage() {
  const router = useRouter();
  const qc = useQueryClient();

  const availableAdmins = useQuery({
    queryKey: ["stores", "available-admins"],
    queryFn: () => storesApi.availableAdmins(),
    refetchOnMount: "always",
    staleTime: 0,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const hasPin = latitude !== 0 || longitude !== 0;

  const create = useMutation({
    mutationFn: (values: FormInput) => storesApi.create(values),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["stores"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
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

      <AdminCard className="max-w-3xl">
        <form
          onSubmit={handleSubmit((v) => create.mutate(v))}
          className="space-y-5"
        >
          <Input
            label="Tên chi nhánh"
            admin
            required
            error={errors.name?.message}
            {...register("name")}
          />
          <Textarea
            label="Địa chỉ"
            admin
            required
            rows={2}
            error={errors.address?.message}
            {...register("address")}
          />
          <Input
            label="Số liên hệ"
            admin
            type="tel"
            required
            error={errors.contact?.message}
            {...register("contact")}
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-200">
              Vị trí trên bản đồ <span className="text-red-400">*</span>
            </span>
            <p className="text-admin-text-muted -mt-0.5 text-xs">
              Tìm địa chỉ hoặc click trực tiếp lên bản đồ để pin vị trí. Có thể
              kéo pin để điều chỉnh.
            </p>
            <LocationPicker
              admin
              latitude={hasPin ? latitude : null}
              longitude={hasPin ? longitude : null}
              onChange={({ latitude: lat, longitude: lon }) => {
                setValue("latitude", lat, { shouldValidate: true });
                setValue("longitude", lon, { shouldValidate: true });
              }}
            />
            {errors.latitude && (
              <span className="text-[13px] text-red-400">
                {errors.latitude.message}
              </span>
            )}
          </div>

          <AdminPicker
            query={availableAdmins}
            register={register}
            error={errors.adminId?.message}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="admin-ghost"
              onClick={() => router.back()}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              variant="admin-primary"
              loading={create.isPending}
            >
              Tạo chi nhánh
            </Button>
          </div>
        </form>
      </AdminCard>
    </>
  );
}

interface AdminPickerProps {
  query: UseQueryResult<Account[], Error>;
  register: UseFormRegister<FormInput>;
  error?: string;
}

function AdminPicker({ query, register, error }: Readonly<AdminPickerProps>) {
  if (query.isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 text-admin-text-muted text-sm">
        <Spinner size={16} className="text-primary-300" />
        <span>Đang tải danh sách store admin...</span>
      </div>
    );
  }

  if (query.error) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
        <div className="flex items-start gap-2.5 text-sm">
          <AlertCircle
            size={18}
            className="mt-0.5 flex-shrink-0 text-red-400"
          />
          <div>
            <p className="font-medium text-red-300">
              Không tải được danh sách store admin
            </p>
            <p className="mt-1 text-xs text-red-300/80">
              {getErrorMessage(query.error, "Lỗi kết nối backend.")}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="admin-ghost"
          size="sm"
          onClick={() => query.refetch()}
        >
          <RefreshCw size={14} />
          Thử lại
        </Button>
      </div>
    );
  }

  const admins = query.data ?? [];

  if (admins.length === 0) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-2.5 text-sm">
          <AlertCircle
            size={18}
            className="mt-0.5 flex-shrink-0 text-amber-400"
          />
          <div>
            <p className="font-medium text-amber-300">
              Chưa có store admin nào trống
            </p>
            <p className="mt-1 text-xs text-amber-200/80">
              Tất cả store admin hiện tại đã được gán vào chi nhánh khác. Tạo
              store admin mới để gán cho chi nhánh này.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="admin-ghost"
            size="sm"
            onClick={() => query.refetch()}
          >
            <RefreshCw size={14} />
            Tải lại
          </Button>
          <Link href="/admin/accounts/create-store-admin">
            <Button type="button" variant="admin-primary" size="sm">
              <UserPlus size={14} />
              Tạo store admin mới
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Select
        label="Quản lý chi nhánh"
        admin
        required
        error={error}
        hint={`${admins.length} store admin sẵn sàng`}
        defaultValue=""
        {...register("adminId", { valueAsNumber: true })}
      >
        <option value="" disabled>
          -- Chọn store admin --
        </option>
        {admins.map((a) => (
          <option key={a.accountId} value={a.accountId}>
            {a.fullName} · {a.email}
          </option>
        ))}
      </Select>
    </div>
  );
}
