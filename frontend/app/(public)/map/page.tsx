"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import "leaflet/dist/leaflet.css";
import { publicDiscoverService } from "@/services/discoverService";
import type { MapMarker } from "@/types/discover";

// Wase LGA approximate center — used as the default map view when no
// specific marker/coordinates are requested via query params.
const DEFAULT_CENTER: [number, number] = [9.1, 9.9];
const DEFAULT_ZOOM = 11;

const MARKER_COLORS: Record<MapMarker["type"], string> = {
  attraction: "#0B7A3B",
  facility: "#C9A227",
  project: "#2563EB",
  community: "#66736B",
};

function MapContent() {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;

    async function init() {
      if (!containerRef.current) return;

      // Leaflet must only be loaded client-side.
      const L = (await import("leaflet")).default;

      const lat = parseFloat(searchParams.get("lat") ?? "");
      const lng = parseFloat(searchParams.get("lng") ?? "");

      const center: [number, number] =
        !isNaN(lat) && !isNaN(lng)
          ? [lat, lng]
          : DEFAULT_CENTER;

      const zoom =
        !isNaN(lat) && !isNaN(lng)
          ? 15
          : DEFAULT_ZOOM;

      map = L.map(containerRef.current).setView(center, zoom);

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map);

      try {
        const markers = await publicDiscoverService.map();

        markers.forEach((m) => {
          L.circleMarker([m.lat, m.lng], {
            radius: 8,
            color: MARKER_COLORS[m.type],
            fillColor: MARKER_COLORS[m.type],
            fillOpacity: 0.8,
          })
            .addTo(map!)
            .bindPopup(
              `<strong>${m.name}</strong><br/>${m.type.replace("_", " ")}`
            );
        });
      } catch {
        // Non-fatal — the base map still renders without markers.
      }

      setLoading(false);
    }

    init().catch(() => {
      setError(true);
      setLoading(false);
    });

    return () => {
      map?.remove();
    };
  }, [searchParams]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">
        Explore Wase
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Tourist attractions, public facilities, development projects,
        and communities across Wase LGA.
      </p>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-muted">
        {Object.entries(MARKER_COLORS).map(([type, color]) => (
          <span
            key={type}
            className="flex items-center gap-1.5"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {type.replace("_", " ")}
          </span>
        ))}
      </div>

      <div className="relative mt-4 h-[500px] w-full overflow-hidden rounded-card border border-black/5">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-bg">
            <p className="text-sm text-ink-muted">
              Loading map…
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-bg">
            <p className="text-sm text-ink-muted">
              Couldn't load the map right now.
            </p>
          </div>
        )}

        <div
          ref={containerRef}
          className="h-full w-full"
        />
      </div>
    </section>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h1 className="text-2xl font-semibold text-ink">
            Explore Wase
          </h1>

          <div className="relative mt-4 h-[500px] w-full overflow-hidden rounded-card border border-black/5">
            <div className="flex h-full items-center justify-center bg-surface-bg">
              <p className="text-sm text-ink-muted">
                Loading map…
              </p>
            </div>
          </div>
        </section>
      }
    >
      <MapContent />
    </Suspense>
  );
}