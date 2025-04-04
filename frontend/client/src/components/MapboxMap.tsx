import { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SAULT_COLLEGE_TORONTO = {
  lat: 43.65694,
  lng: -79.452217
};

const INITIAL_ZOOM = 15; // Increased zoom for better visibility of the geofence
const GEOFENCE_RADIUS = 500; // meters

interface MapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  geofence?: any;
  onGeofenceChange?: (geofence: any) => void;
  readOnly?: boolean;
}

export function MapboxMap({
  center = SAULT_COLLEGE_TORONTO,
  zoom = INITIAL_ZOOM,
  geofence,
  onGeofenceChange,
  readOnly = false,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [isGeofenceEnabled, setIsGeofenceEnabled] = useState(true);

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

        // Automatically create the geofence when map loads
        if (!readOnly && !circleRef.current) {
          const circle = new google.maps.Circle({
            map,
            center: SAULT_COLLEGE_TORONTO,
            radius: GEOFENCE_RADIUS,
            fillColor: '#4338ca',
            fillOpacity: 0.2,
            strokeWeight: 2,
            strokeColor: '#4338ca',
            editable: false,
            visible: isGeofenceEnabled,
          });

          circleRef.current = circle;

          // Notify parent component of geofence
          if (onGeofenceChange) {
            const geofenceData = {
              center: SAULT_COLLEGE_TORONTO,
              radius: GEOFENCE_RADIUS,
            };
            onGeofenceChange(geofenceData);
          }
        }
      });

      // Add drawing manager if not in readonly mode
      if (!readOnly) {
        const drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: null, // Don't start in drawing mode
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.CIRCLE],
          },
          circleOptions: {
            fillColor: '#4338ca',
            fillOpacity: 0.2,
            strokeWeight: 2,
            strokeColor: '#4338ca',
            editable: false,
            radius: GEOFENCE_RADIUS,
            visible: isGeofenceEnabled,
          },
        });

        drawingManager.setMap(map);

        // Handle circle creation
        google.maps.event.addListener(drawingManager, 'circlecomplete', (circle: google.maps.Circle) => {
          // Remove any existing circle
          if (circleRef.current) {
            circleRef.current.setMap(null);
          }

          // Set the radius to 500 meters
          circle.setRadius(GEOFENCE_RADIUS);
          circle.setEditable(false);
          circle.setVisible(isGeofenceEnabled);
          circleRef.current = circle;

          // Notify parent component of geofence change
          if (onGeofenceChange) {
            const geofenceData = {
              center: {
                lat: circle.getCenter()?.lat() || 0,
                lng: circle.getCenter()?.lng() || 0,
              },
              radius: GEOFENCE_RADIUS,
            };
            onGeofenceChange(geofenceData);
          }

          // Disable drawing mode after creating a circle
          drawingManager.setDrawingMode(null);
        });
      }

      // If geofence data exists, display it
      if (geofence && !circleRef.current) {
        circleRef.current = new google.maps.Circle({
          map,
          center: geofence.center,
          radius: GEOFENCE_RADIUS,
          fillColor: '#4338ca',
          fillOpacity: 0.2,
          strokeWeight: 2,
          strokeColor: '#4338ca',
          editable: false,
          visible: isGeofenceEnabled,
        });
      }

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map. Please try again later.');
      setIsLoading(false);
    }
  }, [center, zoom, readOnly, geofence, onGeofenceChange, isGeofenceEnabled]);

  // Toggle geofence visibility
  const toggleGeofence = () => {
    if (circleRef.current) {
      const newState = !isGeofenceEnabled;
      circleRef.current.setVisible(newState);
      setIsGeofenceEnabled(newState);
    }
  };

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
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-end">
          <Button
            variant={isGeofenceEnabled ? "default" : "outline"}
            onClick={toggleGeofence}
          >
            {isGeofenceEnabled ? 'Disable Geofence' : 'Enable Geofence'}
          </Button>
        </div>
      )}

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
    </div>
  );
}