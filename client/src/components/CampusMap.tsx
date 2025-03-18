import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Event } from "@shared/schema";

const SAULT_COLLEGE_TORONTO = {
  lat: 43.65694,
  lng: -79.452217
};

const CAMPUS_BUILDINGS = [
  {
    id: 'main-building',
    name: 'Main Building',
    location: { lat: 43.65694, lng: -79.452217 },
    description: 'Main academic building with classrooms and administrative offices'
  },
  {
    id: 'library',
    name: 'Library',
    location: { lat: 43.65704, lng: -79.452317 },
    description: 'Campus library and study spaces'
  },
  {
    id: 'student-center',
    name: 'Student Center',
    location: { lat: 43.65684, lng: -79.452117 },
    description: 'Student activities and services'
  }
];

// Event category colors
const EVENT_COLORS = {
  lecture: '#4338ca', // Indigo
  lab: '#059669', // Emerald
  exam: '#dc2626', // Red
  workshop: '#d97706', // Amber
  other: '#6b7280', // Gray
};

interface CampusMapProps {
  className?: string;
}

export function CampusMap({ className }: CampusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<google.maps.Marker | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current events with real-time updates
  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  useEffect(() => {
    if (!mapRef.current) return;

    try {
      console.log('Initializing Google Maps...');
      setIsLoading(true);
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
      setMap(mapInstance);
      setInfoWindow(new google.maps.InfoWindow());

      // Add campus buildings
      CAMPUS_BUILDINGS.forEach(building => {
        console.log(`Creating marker for building: ${building.name}`);
        const buildingEvents = events?.filter(event => 
          event.location?.buildingId === building.id
        );

        // Get the color based on the most imminent event's category
        const mostImminentEvent = buildingEvents?.reduce((nearest, current) => {
          return new Date(current.dueDate) < new Date(nearest.dueDate) ? current : nearest;
        }, buildingEvents[0]);

        const markerColor = mostImminentEvent 
          ? EVENT_COLORS[mostImminentEvent.category as keyof typeof EVENT_COLORS] || EVENT_COLORS.other
          : EVENT_COLORS.other;

        const marker = new google.maps.Marker({
          position: building.location,
          map: mapInstance,
          title: building.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: markerColor,
            fillOpacity: 0.7,
            strokeWeight: 2,
            strokeColor: markerColor,
          }
        });

        marker.addListener('click', () => {
          if (infoWindow) {
            infoWindow.close();

            // Find events for this building
            const buildingEvents = events?.filter(event => {
              console.log('Event location:', event.location);
              return event.location?.buildingId === building.id;
            });

            console.log(`Found ${buildingEvents?.length || 0} events for building: ${building.name}`);

            const eventsHtml = buildingEvents?.length 
              ? `<div class="mt-2">
                  <strong>Current Events:</strong>
                  <ul class="list-disc pl-4">
                    ${buildingEvents.map(event => `
                      <li style="color: ${EVENT_COLORS[event.category as keyof typeof EVENT_COLORS] || EVENT_COLORS.other}">
                        ${event.title} (${event.category}) - ${new Date(event.dueDate).toLocaleTimeString()}
                      </li>
                    `).join('')}
                  </ul>
                </div>`
              : '';

            infoWindow.setContent(`
              <div class="p-2">
                <h3 class="text-lg font-bold">${building.name}</h3>
                <p class="text-sm text-gray-600">${building.description}</p>
                ${eventsHtml}
              </div>
            `);
            infoWindow.open(mapInstance, marker);
          }
        });
      });

      setIsLoading(false);
      console.log('Map initialization complete');
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsLoading(false);
    }
  }, [events]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Campus Map</CardTitle>
        <CardDescription>
          Interactive map showing campus buildings and current events
        </CardDescription>
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(EVENT_COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-sm capitalize">{category}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-[500px] rounded-lg border"
          />

          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Loading campus map...
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}