"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  MapPin,
  Phone,
  Store as StoreIcon,
  User,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { storesApi } from "@/lib/api/stores";
import type { Store } from "@/types/api";

export default function StoresPage() {
  const stores = useQuery({
    queryKey: ["stores", "public-list"],
    queryFn: () => storesApi.list(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="container-app py-12">
      <header className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs tracking-widest text-stone-400 uppercase">
          Hệ thống cửa hàng
        </p>
        <h1 className="font-display mt-3 text-5xl font-extrabold tracking-tight text-stone-900">
          Đến gặp chúng tôi
        </h1>
        <p className="mt-4 text-base text-stone-500">
          Cầm thử vợt, tư vấn trực tiếp với người chơi cầu lông chuyên nghiệp.
          Tất cả chi nhánh đều mở cửa 8:00 — 21:00 (T2 — CN).
        </p>
      </header>

      <section className="mx-auto mt-14 max-w-5xl">
        <StoresContent
          loading={stores.isLoading}
          stores={stores.data ?? []}
        />
      </section>
    </div>
  );
}

interface StoresContentProps {
  loading: boolean;
  stores: Store[];
}

function StoresContent({ loading, stores }: Readonly<StoresContentProps>) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="text-primary-700" size={32} />
      </div>
    );
  }
  if (stores.length === 0) {
    return (
      <EmptyState
        icon={<StoreIcon size={56} />}
        title="Chưa có chi nhánh nào"
        description="Hệ thống cửa hàng đang được setup. Quay lại sau nhé!"
      />
    );
  }
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {stores.map((s) => (
        <StoreCard key={s.storeId} store={s} />
      ))}
    </ul>
  );
}

function StoreCard({ store }: Readonly<{ store: Store }>) {
  const mapsUrl = `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;

  return (
    <li className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow hover:shadow-lg">
      <div className="bg-soft-glow flex h-32 items-center justify-center border-b border-stone-200 bg-stone-50">
        <div className="bg-primary-700 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary-700/20">
          <StoreIcon size={24} />
        </div>
      </div>

      <div className="p-6">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-stone-900">
          {store.name}
        </h2>

        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex items-start gap-2.5">
            <MapPin
              size={16}
              className="mt-0.5 flex-shrink-0 text-stone-400"
            />
            <dd className="text-stone-700">{store.address}</dd>
          </div>

          <div className="flex items-center gap-2.5">
            <Phone size={16} className="flex-shrink-0 text-stone-400" />
            <dd>
              <a
                href={`tel:${store.contact}`}
                className="font-mono text-stone-700 hover:text-primary-700"
              >
                {store.contact}
              </a>
            </dd>
          </div>

          {store.admin && (
            <div className="flex items-center gap-2.5">
              <User size={16} className="flex-shrink-0 text-stone-400" />
              <dd className="text-stone-500 text-xs">
                Quản lý:{" "}
                <span className="text-stone-700">{store.admin.fullName}</span>
              </dd>
            </div>
          )}
        </dl>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
        >
          <span>Xem trên Google Maps</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </li>
  );
}
