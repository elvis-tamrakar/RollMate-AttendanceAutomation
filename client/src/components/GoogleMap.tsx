import { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  geofence: any;
  onGeofenceChange: (geofence: any) => void;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export function GoogleMap({ geofence, onGeofenceChange }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 43.65694, lng: -79.452217 }, // Default center
      zoom: 15,
      mapTypeId: 'roadmap',
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    // Initialize drawing manager
    const drawingManagerInstance = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
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
      // Remove previous polygon if exists
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

      // Add path change listener
      google.maps.event.addListener(path, 'set_at', () => {
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

  // Display existing geofence if available
  useEffect(() => {
    if (!map || !geofence) return;

    if (currentPolygon) {
      currentPolygon.setMap(null);
    }

    if (geofence.coordinates && geofence.coordinates[0]) {
      const polygonPath = geofence.coordinates[0].map((coord: [number, number]) => ({
        lat: coord[1],
        lng: coord[0],
      }));

      const polygon = new google.maps.Polygon({
        paths: polygonPath,
        fillColor: '#4338ca',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#4338ca',
        editable: true,
        draggable: true,
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
    }
  }, [map, geofence]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-lg border" />;
}