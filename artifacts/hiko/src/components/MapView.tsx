import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Route } from "@/store/useDataStore";
import { motion } from "framer-motion";

// Custom icons
const createCustomIcon = (color: string, size: number = 24) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div style="width: ${size}px; height: ${size}px; background-color: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const userIcon = L.divIcon({
  className: "custom-leaflet-icon",
  html: `<div class="w-6 h-6 bg-hiko-primary rounded-full border-2 border-white marker-pulse"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const routeIcon = createCustomIcon("var(--color-hiko-primary)", 20);
const challengeIcon = createCustomIcon("#FFB800", 24);
const runnerIcon = createCustomIcon("rgba(255,255,255,0.8)", 16);

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
