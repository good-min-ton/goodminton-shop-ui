"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { Store } from "@/types/api";
import { createStoreMarkerIcon } from "./store-marker-icon";

interface StoresMapInnerProps {
  stores: Store[];
  activeStoreId: number | null;
  onMarkerClick?: (storeId: number) => void;
  height?: number | string;
}

const VIETNAM_CENTER: [number, number] = [16.0, 106.0];
const DEFAULT_ZOOM = 6;

export default function StoresMapInner({
  stores,
  activeStoreId,
  onMarkerClick,
  height = 480,
}: Readonly<StoresMapInnerProps>) {
  const validStores = stores.filter(
    (s) =>
      Number.isFinite(s.latitude) &&
      Number.isFinite(s.longitude) &&
      Math.abs(s.latitude) <= 90 &&
      Math.abs(s.longitude) <= 180,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
      <MapContainer
        center={VIETNAM_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height, width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBoundsToMarkers stores={validStores} />
        <FlyToActive
          stores={validStores}
          activeStoreId={activeStoreId}
        />
        {validStores.map((s) => {
          const active = s.storeId === activeStoreId;
          return (
            <Marker
              key={s.storeId}
              position={[s.latitude, s.longitude]}
              icon={createStoreMarkerIcon(active)}
              eventHandlers={{
                click: () => onMarkerClick?.(s.storeId),
              }}
            >
              <Popup>
                <div className="font-sans">
                  <p className="font-display text-sm font-bold">{s.name}</p>
                  <p className="mt-1 text-xs text-stone-600">{s.address}</p>
                  <a
                    href={`tel:${s.contact}`}
                    className="mt-1 font-mono text-xs text-primary-700 hover:underline"
                  >
                    {s.contact}
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function FitBoundsToMarkers({ stores }: Readonly<{ stores: Store[] }>) {
  const map = useMap();
  useEffect(() => {
    if (stores.length === 0) return;
    const bounds = L.latLngBounds(
      stores.map((s) => [s.latitude, s.longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [stores, map]);
  return null;
}

function FlyToActive({
  stores,
  activeStoreId,
}: Readonly<{ stores: Store[]; activeStoreId: number | null }>) {
  const map = useMap();
  useEffect(() => {
    if (activeStoreId == null) return;
    const target = stores.find((s) => s.storeId === activeStoreId);
    if (!target) return;
    map.flyTo([target.latitude, target.longitude], 15, { duration: 0.6 });
  }, [activeStoreId, stores, map]);
  return null;
}
