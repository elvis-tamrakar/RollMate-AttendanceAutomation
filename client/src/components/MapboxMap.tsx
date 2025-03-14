import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

// Ensure token is set
if (!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) {
  console.error('Mapbox token is required');
}

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
  center = [85.3240, 27.7172], // Default to Kathmandu coordinates
  zoom = 12,
  geofence,
  onGeofenceChange,
  readOnly = false,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center,
        zoom,
        transformRequest: (url, resourceType) => {
          // Add error handling for transformRequest
          if (resourceType === 'Source' || resourceType === 'Tile') {
            return {
              url,
              headers: {
                'Authorization': `Bearer ${mapboxgl.accessToken}`,
              },
            };
          }
          return { url };
        },
      });

      map.current.on('load', () => {
        if (!readOnly && map.current) {
          // Initialize the draw control
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
      });

      // Error handling
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError('Failed to load map resources. Please check your internet connection.');
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please try again later.');
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

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-lg border bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
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
    <div 
      ref={mapContainer} 
      className="w-full h-[400px] rounded-lg border"
    />
  );
}