import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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

const MIN_RADIUS = 100; // 100 meters
const MAX_RADIUS = 1000; // 1 kilometer
const DEFAULT_RADIUS = 300; // 300 meters

export function GoogleMap({ geofence, onGeofenceChange }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<google.maps.Polygon | null>(null);
  const [isGeofenceEnabled, setIsGeofenceEnabled] = useState(true);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);

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

  // Update geofence when radius changes
  const updateGeofenceRadius = (newRadius: number) => {
    setRadius(newRadius);
    const circlePoints = createCirclePoints(SAULT_COLLEGE_TORONTO, newRadius);
    onGeofenceChange({ type: 'Polygon', coordinates: [circlePoints] });
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

      // Add a marker for Sault College
      new google.maps.Marker({
        position: SAULT_COLLEGE_TORONTO,
        map: mapInstance,
        title: "Sault College Toronto Campus",
        animation: google.maps.Animation.DROP
      });

      setMap(mapInstance);

      console.log('Map instance created successfully');
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
      const circlePoints = createCirclePoints(SAULT_COLLEGE_TORONTO, radius);
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
      editable: false,
      draggable: false,
      visible: isGeofenceEnabled,
      zIndex: 1,
      clickable: true
    });

    polygon.setMap(map);
    setCurrentPolygon(polygon);
  }, [map, geofence, isGeofenceEnabled, radius]);

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

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium">Geofence Radius</label>
          <span className="text-sm text-muted-foreground">{radius} meters</span>
        </div>
        <Slider
          value={[radius]}
          onValueChange={([value]) => updateGeofenceRadius(value)}
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step={50}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>100m</span>
          <span>1km</span>
        </div>
      </div>

      <div className="relative">
        <div ref={mapRef} className="w-full h-[400px] rounded-lg border" />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {isGeofenceEnabled 
            ? "Geofence is active. Students must be within this area during class hours." 
            : "Geofence is disabled. Attendance must be marked manually."}
        </p>
        <p className="text-sm text-muted-foreground">
          Adjust the radius slider above to increase or decrease the geofence area around Sault College Toronto Campus.
        </p>
      </div>
    </div>
  );
}