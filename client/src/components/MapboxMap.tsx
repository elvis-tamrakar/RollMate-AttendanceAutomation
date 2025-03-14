import { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return;

    try {
      setIsLoading(true);
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      });

      // Add listener for when map is fully loaded
      google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
        console.log('Map tiles loaded successfully');
        setIsLoading(false);
      });

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
      setIsLoading(false);
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
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-[400px] rounded-lg border"
      />

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground animate-pulse">
              Initializing map...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}