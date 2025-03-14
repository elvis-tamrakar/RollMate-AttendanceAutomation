import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const GEOFENCE_RADIUS = 500; // meters

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
      // Initialize the draw control with circle drawing capability
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        styles: [
          {
            'id': 'gl-draw-polygon-fill',
            'type': 'fill',
            'filter': ['all', ['==', '$type', 'Polygon']],
            'paint': {
              'fill-color': '#3b82f6',
              'fill-opacity': 0.1
            }
          },
          {
            'id': 'gl-draw-polygon-stroke',
            'type': 'line',
            'filter': ['all', ['==', '$type', 'Polygon']],
            'paint': {
              'line-color': '#3b82f6',
              'line-width': 2
            }
          }
        ]
      });

      map.current.addControl(draw.current);

      // Event handlers for geofence changes
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

  // Update the drawn geofence when prop changes
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