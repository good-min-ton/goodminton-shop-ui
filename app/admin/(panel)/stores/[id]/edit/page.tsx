"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { LocationPicker } from "@/components/map/location-picker";
import { storesApi } from "@/lib/api/stores";
import { getErrorMessage } from "@/lib/error-messages";
import { toast } from "@/store/toast-store";

const storeSchema = z
  .object({
    name: z.string().min(2, "Tên tối thiểu 2 ký tự").max(120),
    address: z.string().min(8, "Vui lòng nhập địa chỉ đầy đủ").max(255),
    contact: z.string().min(8, "Số điện thoại không hợp lệ").max(20),
    longitude: z.number().min(-180).max(180),
    latitude: z.number().min(-90).max(90),
    adminId: z.number().int().positive("Vui lòng chọn quản lý"),
    isCentral: z.boolean(),
  })
  .refine((v) => !(v.latitude === 0 && v.longitude === 0), {
    path: ["latitude"],
    message: "Vui lòng chọn vị trí cửa hàng trên bản đồ",
  });
type FormInput = z.infer<typeof storeSchema>;

export default function EditStorePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? Number(params.id) : 0;
  const router = useRouter();
  const qc = useQueryClient();

  const store = useQuery({
    queryKey: ["stores", "detail", id],
    queryFn: () => storesApi.detail(id),
    enabled: id > 0,
  });

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
    reset,
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
      isCentral: false,
    },
  });

  useEffect(() => {
    if (!store.data) return;
    reset({
      name: store.data.name,
      address: store.data.address,
      contact: store.data.contact,
      longitude: store.data.longitude,
      latitude: store.data.latitude,
      adminId: store.data.admin?.id ?? 0,
      isCentral: store.data.isCentral,
    });
  }, [store.data, reset]);

  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const hasPin = latitude !== 0 || longitude !== 0;

  const update = useMutation({
    mutationFn: (values: FormInput) => storesApi.update(id, values),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["stores"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast(`Đã cập nhật ${s.name}`, "success");
      router.replace(`/admin/stores/${id}`);
    },
    onError: (err) => {
      toast(getErrorMessage(err, "Không cập nhật được chi nhánh"), "error");
    },
  });

  if (store.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="text-primary-300" size={32} />
      </div>
    );
  }

  if (!store.data) {
    return <EmptyState title="Không tìm thấy chi nhánh" />;
  }

  const currentAdmin = store.data.admin;
  // Merge current admin (already assigned) with available list so user can
  // keep current selection or switch to a free admin.
  const adminOptions = [
    ...(currentAdmin ? [currentAdmin] : []),
    ...(availableAdmins.data ?? []).filter(
      (a) => a.id !== currentAdmin?.id,
    ),
  ];

  return (
    <>
      <AdminPageHeader
        title={`Chỉnh sửa ${store.data.name}`}
        breadcrumbs={[
          { label: "Chi nhánh", href: "/admin/stores" },
          { label: `#${store.data.id}`, href: `/admin/stores/${id}` },
          { label: "Chỉnh sửa" },
        ]}
      />

      <AdminCard className="max-w-3xl">
        <form
          onSubmit={handleSubmit((v) => update.mutate(v))}
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
              Click hoặc kéo pin để điều chỉnh.
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

          <Select
            label="Quản lý chi nhánh"
            admin
            required
            error={errors.adminId?.message}
            hint={
              availableAdmins.isLoading
                ? "Đang tải danh sách admin..."
                : `${adminOptions.length} lựa chọn`
            }
            {...register("adminId", { valueAsNumber: true })}
          >
            <option value={0} disabled>
              -- Chọn store admin --
            </option>
            {adminOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.fullName} · {a.email}
                {a.id === currentAdmin?.id ? " (hiện tại)" : ""}
              </option>
            ))}
          </Select>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-stone-200">
              Loại chi nhánh
            </span>
            <label className="text-admin-text inline-flex items-start gap-2.5 rounded-lg border border-admin-border bg-admin-surface-2 px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                {...register("isCentral")}
                className="mt-0.5 h-4 w-4 accent-primary-400"
              />
              <span className="flex flex-col gap-0.5">
                <span>Đặt làm kho trung tâm (HQ)</span>
                <span className="text-admin-text-muted text-xs">
                  Chỉ 1 chi nhánh được làm trung tâm. Bật ở đây sẽ tự huỷ trung
                  tâm hiện tại nếu có.
                </span>
              </span>
            </label>
          </div>

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
              loading={update.isPending}
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </AdminCard>
    </>
  );
}
