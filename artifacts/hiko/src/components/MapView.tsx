import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Route } from "@/store/useDataStore";

// Custom icons
const createDotIcon = (color: string, size: number = 24) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div style="width: ${size}px; height: ${size}px; background-color: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const createPinIcon = (color: string, size: number = 36) => {
  const w = size;
  const h = Math.round(size * 1.3);
  const html = `
    <div style="width:${w}px;height:${h}px;display:flex;align-items:flex-start;justify-content:center;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.45));">
      <svg width="${w}" height="${h}" viewBox="0 0 24 31" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 19 12 19s12-10.5 12-19C24 5.373 18.627 0 12 0z" fill="${color}"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 8.5 12 19 12 19s12-10.5 12-19C24 5.373 18.627 0 12 0z" fill="none" stroke="white" stroke-width="1.5" stroke-opacity="0.9"/>
        <circle cx="12" cy="12" r="4.5" fill="white"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    className: "custom-leaflet-icon",
    html,
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
  });
};

const userIcon = L.divIcon({
  className: "custom-leaflet-icon",
  html: `<div class="w-6 h-6 bg-hiko-primary rounded-full border-2 border-white marker-pulse"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const routeIcon = createPinIcon("#0ebc68", 36);
const runnerIcon = createDotIcon("rgba(255,255,255,0.85)", 14);

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  routes?: Route[];
  runners?: { id: string; lat: number; lng: number }[];
  activeRoute?: Route | null;
  userPos?: [number, number];
  onRouteClick?: (route: Route) => void;
  interactive?: boolean;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (zoom) {
      map.flyTo(center, zoom, { duration: 1.5 });
    } else {
      map.panTo(center, { animate: true, duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ 
  center, 
  zoom = 14, 
  routes = [], 
  runners = [], 
  activeRoute, 
  userPos, 
  onRouteClick,
  interactive = true 
}: MapViewProps) {
  
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      zoomControl={false}
      dragging={interactive}
      touchZoom={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      className="w-full h-full bg-[#0a0a0a]"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      <MapUpdater center={center} zoom={zoom} />

      {/* Routes */}
      {!activeRoute && routes.map(route => (
        <Marker 
          key={route.id} 
          position={route.center} 
          icon={routeIcon}
          eventHandlers={{
            click: () => onRouteClick?.(route)
          }}
        />
      ))}

      {/* Active Route Line */}
      {activeRoute && (
        <Polyline 
          positions={activeRoute.waypoints} 
          color="var(--color-hiko-primary)" 
          weight={4}
          opacity={0.8}
        />
      )}

      {/* Other Runners */}
      {runners.map(runner => (
        <Marker 
          key={runner.id} 
          position={[runner.lat, runner.lng]} 
          icon={runnerIcon} 
        />
      ))}

      {/* User Position */}
      {userPos && (
        <Marker position={userPos} icon={userIcon} />
      )}
    </MapContainer>
  );
}
