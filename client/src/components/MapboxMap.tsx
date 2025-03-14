import { useState, useCallback } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

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
    console.log("Map loaded successfully");
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
      loadingElement={
        <div className="w-full h-[400px] rounded-lg border bg-gray-50 flex items-center justify-center">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      }
      onError={(error) => {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load Google Maps. Please check your API key and try again.');
      }}
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
      />
    </LoadScript>
  );
}