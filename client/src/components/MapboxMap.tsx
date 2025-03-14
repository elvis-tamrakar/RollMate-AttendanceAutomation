import { useEffect, useRef, useState } from "react";

// Load Mapbox GL JS from CDN
const mapboxgl = (window as any).mapboxgl;
const MapboxDraw = (window as any).MapboxDraw;

// Ensure token is set before any initialization
const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
if (!token) {
  console.error("Mapbox token is missing from environment variables");
  throw new Error("Mapbox token is required");
}

// Set the token
mapboxgl.accessToken = token;

console.log("Initializing Mapbox with token:", token.substring(0, 8) + "...");

const GEOFENCE_RADIUS = 500; // meters

interface MapboxMapProps {
  center?: [number, number];
  zoom?: number;
  geofence?: any;
  onGeofenceChange?: (geofence: any) => void;
  readOnly?: boolean;
}

export function MapboxMap({
  center = [-79.3832, 43.6532], // Toronto coordinates
  zoom = 11,
  geofence,
  onGeofenceChange,
  readOnly = false,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const draw = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      console.log("Creating map instance...", {
        center,
        zoom,
        token: token.substring(0, 8) + "..."
      });

      // Create new map instance
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center,
        zoom,
        attributionControl: false,
      });

      // Add basic controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Error handling
      map.current.on("error", (e: any) => {
        console.error("Mapbox error:", e);
        setError(
          "Failed to load map resources. Please check your internet connection."
        );
      });

      // Initialize drawing tools after map loads
      map.current.on("load", () => {
        console.log("Map loaded successfully");

        if (!readOnly && MapboxDraw) {
          draw.current = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
              polygon: true,
              trash: true,
            },
          });

          map.current.addControl(draw.current);

          // Set initial geofence if provided
          if (geofence) {
            draw.current.set(geofence);
          }

          // Event handlers for geofence changes
          map.current.on("draw.create", () => {
            const data = draw.current?.getAll();
            onGeofenceChange?.(data);
          });

          map.current.on("draw.delete", () => {
            const data = draw.current?.getAll();
            onGeofenceChange?.(data);
          });

          map.current.on("draw.update", () => {
            const data = draw.current?.getAll();
            onGeofenceChange?.(data);
          });
        }
      });
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map. Please try again later.");
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update geofence when prop changes
  useEffect(() => {
    if (draw.current && geofence) {
      draw.current.set(geofence);
    }
  }, [geofence]);

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-lg border bg-gray-50 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>{error}</p>
          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className="w-full h-[400px] rounded-lg border" />
  );
}