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

    // Initialize map
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: SAULT_COLLEGE_TORONTO,
      zoom: 17,
      mapTypeId: 'roadmap',
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    // Initialize drawing manager
    const drawingManagerInstance = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON],
      },
      polygonOptions: {
        fillColor: '#4338ca',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#4338ca',
        editable: true,
        draggable: true,
      },
    });

    drawingManagerInstance.setMap(mapInstance);
    setMap(mapInstance);
    setDrawingManager(drawingManagerInstance);

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
    });

    return () => {
      if (map) {
        map.setMap(null);
      }
      if (drawingManager) {
        drawingManager.setMap(null);
      }
      if (currentPolygon) {
        currentPolygon.setMap(null);
      }
    };
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
      strokeWeight: 2,
      strokeColor: '#4338ca',
      editable: true,
      draggable: true,
      visible: isGeofenceEnabled,
    });

    polygon.setMap(map);
    setCurrentPolygon(polygon);

    // Add path change listener
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
      <Button 
        variant="outline" 
        onClick={toggleGeofence}
        className="flex items-center gap-2"
      >
        {isGeofenceEnabled ? (
          <>
            <ToggleRight className="h-4 w-4" />
            Disable Geofence
          </>
        ) : (
          <>
            <ToggleLeft className="h-4 w-4" />
            Enable Geofence
          </>
        )}
      </Button>
      <div ref={mapRef} className="w-full h-[400px] rounded-lg border" />
      <p className="text-sm text-muted-foreground">
        {isGeofenceEnabled 
          ? "Geofence is active. Students must be within this area during class hours. You can modify the area by dragging the white squares on the boundary." 
          : "Geofence is disabled. Attendance must be marked manually."}
      </p>
    </div>
  );
}