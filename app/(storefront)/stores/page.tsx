"use client";

import { useState } from "react";
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
import { StoresMap } from "@/components/map/stores-map";
import { storesApi } from "@/lib/api/stores";
import { cn } from "@/lib/utils";
import type { Store } from "@/types/api";

export default function StoresPage() {
  const [activeId, setActiveId] = useState<number | null>(null);

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

      <section className="mt-12">
        <Content
          loading={stores.isLoading}
          stores={stores.data ?? []}
          activeId={activeId}
          onPick={setActiveId}
        />
      </section>
    </div>
  );
}

interface ContentProps {
  loading: boolean;
  stores: Store[];
  activeId: number | null;
  onPick: (id: number | null) => void;
}

function Content({
  loading,
  stores,
  activeId,
  onPick,
}: Readonly<ContentProps>) {
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
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="lg:order-1">
        <StoresMap
          stores={stores}
          activeStoreId={activeId}
          onMarkerClick={(id) => {
            onPick(id);
            const el = document.getElementById(`store-card-${id}`);
            el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }}
          height={560}
        />
      </div>

      <ul className="space-y-3 lg:order-2 lg:max-h-[560px] lg:overflow-y-auto lg:pr-1">
        {stores.map((s) => (
          <StoreCard
            key={s.storeId}
            store={s}
            active={activeId === s.storeId}
            onSelect={() => onPick(s.storeId)}
          />
        ))}
      </ul>
    </div>
  );
}

interface StoreCardProps {
  store: Store;
  active: boolean;
  onSelect: () => void;
}

function StoreCard({ store, active, onSelect }: Readonly<StoreCardProps>) {
  const mapsUrl = `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;

  return (
    <li id={`store-card-${store.storeId}`}>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "block w-full rounded-2xl border-2 bg-white p-5 text-left transition-all",
          active
            ? "border-primary-700 shadow-lg"
            : "border-stone-200 hover:border-stone-300 hover:shadow-md",
        )}
      >
        <h2 className="font-display text-xl font-extrabold tracking-tight text-stone-900">
          {store.name}
        </h2>

        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 flex-shrink-0 text-stone-400" />
            <dd className="text-stone-700">{store.address}</dd>
          </div>

          <div className="flex items-center gap-2">
            <Phone size={14} className="flex-shrink-0 text-stone-400" />
            <dd>
              <a
                href={`tel:${store.contact}`}
                onClick={(e) => e.stopPropagation()}
                className="font-mono text-stone-700 hover:text-primary-700"
              >
                {store.contact}
              </a>
            </dd>
          </div>

          {store.admin && (
            <div className="flex items-center gap-2">
              <User size={14} className="flex-shrink-0 text-stone-400" />
              <dd className="text-xs text-stone-500">
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
          onClick={(e) => e.stopPropagation()}
          className="text-primary-700 mt-4 inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
        >
          <span>Mở trên Google Maps</span>
          <ExternalLink size={11} />
        </a>
      </button>
    </li>
  );
}
