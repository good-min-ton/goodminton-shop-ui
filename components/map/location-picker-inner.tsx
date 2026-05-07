"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { Search } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { createStoreMarkerIcon } from "./store-marker-icon";

interface LocationPickerInnerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (coords: { latitude: number; longitude: number }) => void;
  height?: number;
  admin?: boolean;
}

const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009];
const DEFAULT_ZOOM = 13;

export default function LocationPickerInner({
  latitude,
  longitude,
  onChange,
  height = 380,
  admin = false,
}: Readonly<LocationPickerInnerProps>) {
  const hasPin = latitude != null && longitude != null;
  const initialCenter: [number, number] = hasPin
    ? [latitude, longitude]
    : DEFAULT_CENTER;
  const mapRef = useRef<L.Map>(null);

  function flyTo(lat: number, lon: number) {
    mapRef.current?.flyTo([lat, lon], 16, { duration: 0.6 });
  }

  return (
    <div className="space-y-3">
      <NominatimSearch
        admin={admin}
        onPick={(coords) => {
          onChange(coords);
          flyTo(coords.latitude, coords.longitude);
        }}
      />

      <div
        className={cn(
          "overflow-hidden rounded-xl border",
          admin ? "border-admin-border" : "border-stone-200",
        )}
      >
        <MapContainer
          ref={mapRef}
          center={initialCenter}
          zoom={hasPin ? 15 : DEFAULT_ZOOM}
          style={{ height, width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlacePin onChange={onChange} />
          {hasPin && (
            <DraggableMarker
              latitude={latitude}
              longitude={longitude}
              onChange={onChange}
            />
          )}
        </MapContainer>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs",
          admin ? "bg-admin-surface" : "bg-stone-50",
        )}
      >
        <span className={admin ? "text-admin-text-muted" : "text-stone-500"}>
          Click hoặc kéo pin để chọn toạ độ
        </span>
        {hasPin ? (
          <span
            className={cn(
              "font-mono",
              admin ? "text-admin-text" : "text-stone-700",
            )}
          >
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        ) : (
          <span
            className={cn(
              "italic",
              admin ? "text-admin-text-muted/70" : "text-stone-400",
            )}
          >
            Chưa chọn vị trí
          </span>
        )}
      </div>
    </div>
  );
}

interface ClickToPlacePinProps {
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

function ClickToPlacePin({ onChange }: Readonly<ClickToPlacePinProps>) {
  useMapEvents({
    click(e) {
      onChange({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

interface DraggableMarkerProps {
  latitude: number;
  longitude: number;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

function DraggableMarker({
  latitude,
  longitude,
  onChange,
}: Readonly<DraggableMarkerProps>) {
  const markerRef = useRef<L.Marker>(null);

  return (
    <Marker
      position={[latitude, longitude]}
      draggable
      icon={createStoreMarkerIcon(true)}
      eventHandlers={{
        dragend: () => {
          const m = markerRef.current;
          if (!m) return;
          const pos = m.getLatLng();
          onChange({ latitude: pos.lat, longitude: pos.lng });
        },
      }}
      ref={markerRef}
    />
  );
}

interface NominatimSearchProps {
  onPick: (coords: { latitude: number; longitude: number }) => void;
  admin?: boolean;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

function NominatimSearch({
  onPick,
  admin = false,
}: Readonly<NominatimSearchProps>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function runSearch() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        format: "json",
        addressdetails: "0",
        limit: "5",
        countrycodes: "vn",
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        { headers: { Accept: "application/json" } },
      );
      const data = (await res.json()) as NominatimResult[];
      setResults(data);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function pick(r: NominatimResult) {
    onPick({ latitude: Number(r.lat), longitude: Number(r.lon) });
    setOpen(false);
    setQuery(r.display_name);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      runSearch();
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={14}
          className={cn(
            "absolute top-1/2 left-3 -translate-y-1/2",
            admin ? "text-admin-text-muted" : "text-stone-400",
          )}
        />
        <input
          type="text"
          placeholder="Tìm địa chỉ (vd: 123 Lê Lợi, Quận 1)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          className={cn(
            "w-full rounded-lg py-2 pr-20 pl-9 text-sm outline-none transition-colors",
            admin
              ? "border-admin-border bg-admin-surface-2 text-admin-text placeholder:text-admin-text-muted focus:border-primary-400 border"
              : "focus:border-primary-700 border-[1.5px] border-stone-200 bg-white text-stone-900 placeholder:text-stone-400",
          )}
        />
        <button
          type="button"
          onClick={runSearch}
          disabled={loading || !query.trim()}
          className={cn(
            "absolute top-1/2 right-1 -translate-y-1/2 rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            admin
              ? "bg-primary-400 text-admin-bg hover:bg-primary-300"
              : "bg-primary-700 hover:bg-primary-800 text-white",
          )}
        >
          {loading ? <Spinner size={12} className="text-current" /> : "Tìm"}
        </button>
      </div>

      {open && results.length > 0 && (
        <ul
          className={cn(
            "absolute top-full right-0 left-0 z-[2000] mt-1 max-h-64 overflow-y-auto rounded-lg border shadow-lg",
            admin
              ? "border-admin-border bg-admin-surface"
              : "border-stone-200 bg-white",
          )}
        >
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                onClick={() => pick(r)}
                className={cn(
                  "block w-full px-3 py-2 text-left text-xs",
                  admin
                    ? "text-admin-text hover:bg-admin-surface-2"
                    : "text-stone-700 hover:bg-stone-50",
                )}
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && !loading && results.length === 0 && query && (
        <div
          className={cn(
            "absolute top-full right-0 left-0 z-[2000] mt-1 rounded-lg border p-3 text-xs shadow-lg",
            admin
              ? "border-admin-border bg-admin-surface text-admin-text-muted"
              : "border-stone-200 bg-white text-stone-500",
          )}
        >
          Không tìm thấy địa chỉ. Thử cụ thể hơn.
        </div>
      )}
    </div>
  );
}
