import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet bundler issue).
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export type MapMarker = {
  id: string | number;
  lat: number;
  lng: number;
  title?: string;
  price?: string;
  href?: string;
};

type Props = {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  height?: number | string;
  clickable?: boolean;
  value?: [number, number] | null;
  onChange?: (v: [number, number]) => void;
};

const KARACHI: [number, number] = [24.8607, 67.0011];

export default function LeafletMap({
  center,
  zoom = 11,
  markers = [],
  height = 400,
  clickable = false,
  value,
  onChange,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const pinRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Init map once.
  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView(center ?? KARACHI, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    if (clickable) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
        onChangeRef.current?.(latlng);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update view when center prop changes.
  useEffect(() => {
    if (mapRef.current && center) mapRef.current.setView(center, zoom);
  }, [center?.[0], center?.[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render markers.
  useEffect(() => {
    if (!layerRef.current || !mapRef.current) return;
    layerRef.current.clearLayers();
    if (markers.length === 0) return;
    const bounds: L.LatLngTuple[] = [];
    markers.forEach((m) => {
      const mk = L.marker([m.lat, m.lng]).addTo(layerRef.current!);
      const label = m.title ? `<strong>${escapeHtml(m.title)}</strong>` : "";
      const price = m.price ? `<div style="margin-top:2px;color:#059669;font-weight:500">${escapeHtml(m.price)}</div>` : "";
      const link = m.href
        ? `<a href="${m.href}" style="display:inline-block;margin-top:6px;color:#0f172a;text-decoration:underline;font-size:12px">View property →</a>`
        : "";
      mk.bindPopup(`<div style="min-width:160px">${label}${price}${link}</div>`);
      bounds.push([m.lat, m.lng]);
    });
    if (bounds.length > 1) {
      mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  }, [markers]);

  // Draggable pin for pick-a-location mode.
  useEffect(() => {
    if (!mapRef.current || !clickable) return;
    if (value) {
      if (!pinRef.current) {
        pinRef.current = L.marker(value, { draggable: true }).addTo(mapRef.current);
        pinRef.current.on("dragend", () => {
          const p = pinRef.current!.getLatLng();
          onChangeRef.current?.([p.lat, p.lng]);
        });
      } else {
        pinRef.current.setLatLng(value);
      }
    } else if (pinRef.current) {
      pinRef.current.remove();
      pinRef.current = null;
    }
  }, [value?.[0], value?.[1], clickable]);

  return <div ref={ref} style={{ height, width: "100%", borderRadius: 12, overflow: "hidden" }} />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
