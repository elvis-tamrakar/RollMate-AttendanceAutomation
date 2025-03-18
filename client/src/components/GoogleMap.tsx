import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface GoogleMapProps {
  geofence: any;
  onGeofenceChange: (geofence: any) => void;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

const SAULT_COLLEGE_TORONTO = {
  lat: 43.65694,
  lng: -79.452217
};

const DEFAULT_GEOFENCE_RADIUS = 300; // 300 meters

export function GoogleMap({ geofence, onGeofenceChange }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);
  const [isGeofenceEnabled, setIsGeofenceEnabled] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Helper function to create a circle of points
  const createCirclePoints = (center: { lat: number; lng: number }, radius: number, numPoints = 32) => {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 360 * (Math.PI / 180);
      const lat = center.lat + (radius / 111300) * Math.cos(angle);
      const lng = center.lng + (radius / (111300 * Math.cos(center.lat * (Math.PI / 180)))) * Math.sin(angle);
      points.push([lng, lat]);
    }
    points.push(points[0]); // Close the circle
    return points;
  };

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    try {
      console.log('Initializing Google Maps...');

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: SAULT_COLLEGE_TORONTO,
        zoom: 18,
        mapTypeId: 'roadmap',
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      console.log('Map instance created successfully');

      // Initialize drawing manager with more visible controls
      const drawingManagerInstance = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON]
        },
        polygonOptions: {
          fillColor: '#4338ca',
          fillOpacity: 0.3,
          strokeWeight: 3,
          strokeColor: '#4338ca',
          editable: true,
          draggable: true,
          // Make the editing handles larger
          zIndex: 1,
          clickable: true
        }
      });

      drawingManagerInstance.setMap(mapInstance);
      setMap(mapInstance);
      setDrawingManager(drawingManagerInstance);

      // Add drawing mode listener
      google.maps.event.addListener(drawingManagerInstance, 'drawingmode_changed', () => {
        setIsDrawingMode(!!drawingManagerInstance.getDrawingMode());
      });

      // Add drawing completion listener
      google.maps.event.addListener(drawingManagerInstance, 'polygoncomplete', (polygon) => {
        if (currentPolygon) {
          currentPolygon.setMap(null);
        }
        setCurrentPolygon(polygon);

        // Convert polygon to geofence format
        const path = polygon.getPath();
        const coordinates = Array.from({ length: path.getLength() }, (_, i) => {
          const point = path.getAt(i);
          return [point.lng(), point.lat()];
        });
        onGeofenceChange({ type: 'Polygon', coordinates: [coordinates] });

        // Add path change listeners
        google.maps.event.addListener(path, 'set_at', () => {
          const updatedCoordinates = Array.from({ length: path.getLength() }, (_, i) => {
            const point = path.getAt(i);
            return [point.lng(), point.lat()];
          });
          onGeofenceChange({ type: 'Polygon', coordinates: [updatedCoordinates] });
        });

        google.maps.event.addListener(path, 'insert_at', () => {
          const updatedCoordinates = Array.from({ length: path.getLength() }, (_, i) => {
            const point = path.getAt(i);
            return [point.lng(), point.lat()];
          });
          onGeofenceChange({ type: 'Polygon', coordinates: [updatedCoordinates] });
        });

        // Exit drawing mode after completion
        drawingManagerInstance.setDrawingMode(null);
      });

      console.log('Drawing manager initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  // Display existing geofence or create default one
  useEffect(() => {
    if (!map) return;

    if (currentPolygon) {
      currentPolygon.setMap(null);
    }

    let polygonPath;
    if (geofence?.coordinates && geofence.coordinates[0]) {
      polygonPath = geofence.coordinates[0].map((coord: [number, number]) => ({
        lat: coord[1],
        lng: coord[0],
      }));
    } else {
      // Create default circular geofence
      const circlePoints = createCirclePoints(SAULT_COLLEGE_TORONTO, DEFAULT_GEOFENCE_RADIUS);
      polygonPath = circlePoints.map(([lng, lat]) => ({ lat, lng }));
      // Set the initial geofence
      onGeofenceChange({ type: 'Polygon', coordinates: [circlePoints] });
    }

    const polygon = new google.maps.Polygon({
      paths: polygonPath,
      fillColor: '#4338ca',
      fillOpacity: 0.3,
      strokeWeight: 3,
      strokeColor: '#4338ca',
      editable: true,
      draggable: true,
      visible: isGeofenceEnabled,
      // Make the editing handles larger
      zIndex: 1,
      clickable: true
    });

    polygon.setMap(map);
    setCurrentPolygon(polygon);

    // Add path change listeners
    const path = polygon.getPath();
    google.maps.event.addListener(path, 'set_at', () => {
      const updatedCoordinates = Array.from({ length: path.getLength() }, (_, i) => {
        const point = path.getAt(i);
        return [point.lng(), point.lat()];
      });
      onGeofenceChange({ type: 'Polygon', coordinates: [updatedCoordinates] });
    });

    google.maps.event.addListener(path, 'insert_at', () => {
      const updatedCoordinates = Array.from({ length: path.getLength() }, (_, i) => {
        const point = path.getAt(i);
        return [point.lng(), point.lat()];
      });
      onGeofenceChange({ type: 'Polygon', coordinates: [updatedCoordinates] });
    });
  }, [map, geofence, isGeofenceEnabled]);

  const toggleGeofence = () => {
    setIsGeofenceEnabled(!isGeofenceEnabled);
    if (currentPolygon) {
      currentPolygon.setVisible(!isGeofenceEnabled);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button 
          variant={isGeofenceEnabled ? "default" : "outline"}
          onClick={toggleGeofence}
          className="flex items-center gap-2 min-w-[160px]"
        >
          {isGeofenceEnabled ? (
            <>
              <ToggleRight className="h-4 w-4 text-white" />
              <span>Geofence ON</span>
              <div className="w-2 h-2 rounded-full bg-green-500 ml-2 animate-pulse" />
            </>
          ) : (
            <>
              <ToggleLeft className="h-4 w-4" />
              <span>Geofence OFF</span>
              <div className="w-2 h-2 rounded-full bg-gray-400 ml-2" />
            </>
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          {isGeofenceEnabled ? "Automatic attendance tracking is active" : "Manual attendance marking required"}
        </span>
      </div>

      <div className="relative">
        <div ref={mapRef} className="w-full h-[400px] rounded-lg border" />

        {isDrawingMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg">
            <p className="text-sm font-medium text-primary">
              Click on the map to draw geofence boundary
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {isGeofenceEnabled 
            ? "Geofence is active. Students must be within this area during class hours." 
            : "Geofence is disabled. Attendance must be marked manually."}
        </p>
        <p className="text-sm text-muted-foreground">
          To modify the geofence area:
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Click the polygon icon in the top center to start drawing</li>
            <li>Click on the map to create boundary points</li>
            <li>Close the shape by clicking the first point</li>
            <li>Drag the white squares to adjust the boundary</li>
          </ul>
        </p>
      </div>
    </div>
  );
}