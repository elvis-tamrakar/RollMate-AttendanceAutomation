import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapboxMapProps {
  center?: [number, number];
  zoom?: number;
  geofence?: any;
  onGeofenceChange?: (geofence: any) => void;
  readOnly?: boolean;
}

export function MapboxMap({
  center = [-74.5, 40],
  zoom = 9,
  geofence,
  onGeofenceChange,
  readOnly = false,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center,
      zoom,
    });

    if (!readOnly) {
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
      });

      map.current.addControl(draw.current);

      map.current.on('draw.create', () => {
        const data = draw.current?.getAll();
        onGeofenceChange?.(data);
      });

      map.current.on('draw.delete', () => {
        const data = draw.current?.getAll();
        onGeofenceChange?.(data);
      });

      map.current.on('draw.update', () => {
        const data = draw.current?.getAll();
        onGeofenceChange?.(data);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!draw.current || !geofence) return;
    draw.current.set(geofence);
  }, [geofence]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-[400px] rounded-lg border"
    />
  );
}
