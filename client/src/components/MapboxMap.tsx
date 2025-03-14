import { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, DrawingManager } from '@react-google-maps/api';

const TORONTO_CENTER = {
  lat: 43.6532,
  lng: -79.3832
};

const INITIAL_ZOOM = 11;

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  geofence?: any;
  onGeofenceChange?: (geofence: any) => void;
  readOnly?: boolean;
}

const libraries: ("drawing" | "geometry" | "localContext" | "places" | "visualization")[] = ["drawing"];

export function MapboxMap({
  center = TORONTO_CENTER,
  zoom = INITIAL_ZOOM,
  geofence,
  onGeofenceChange,
  readOnly = false,
}: MapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

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
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
      libraries={libraries}
      loadingElement={
        <div className="w-full h-[400px] rounded-lg border bg-gray-50 flex items-center justify-center">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      }
    >
      <GoogleMap
        mapContainerClassName="w-full h-[400px] rounded-lg border"
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {!readOnly && (
          <DrawingManager
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: window.google?.maps?.ControlPosition?.TOP_CENTER,
                drawingModes: [
                  window.google?.maps?.drawing?.OverlayType?.CIRCLE,
                  window.google?.maps?.drawing?.OverlayType?.POLYGON,
                ],
              },
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}