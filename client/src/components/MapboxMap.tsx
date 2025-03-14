import { useEffect, useRef, useState } from 'react';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    try {
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      // Log successful initialization
      console.log('Map initialized successfully');

      // Add drawing manager if not in readonly mode
      if (!readOnly) {
        const drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
              google.maps.drawing.OverlayType.POLYGON,
              google.maps.drawing.OverlayType.CIRCLE,
            ],
          },
        });

        drawingManager.setMap(map);
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please try again later.');
    }
  }, [center, zoom, readOnly]);

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
    <div 
      ref={mapRef} 
      className="w-full h-[400px] rounded-lg border"
    />
  );
}