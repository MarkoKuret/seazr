'use client';

import { Card, CardContent } from '@/components/ui/card';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import type { VesselLocation } from '@/types';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

interface VesselMapProps {
  locations?: VesselLocation[];
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/boat-marker.png',
  iconUrl: '/images/boat-marker.png',
  shadowUrl: '/images/marker-shadow.png',
});

export default function VesselMap({ locations = [] }: VesselMapProps) {
  const defaultCenter = [44.1, 15.2]; // Adriatic Sea default

  const mapCenter =
    locations.length > 0
      ? [
          locations.reduce((sum, loc) => sum + loc.latitude, 0) /
            locations.length,
          locations.reduce((sum, loc) => sum + loc.longitude, 0) /
            locations.length,
        ]
      : defaultCenter;

  return (
    <Card className='overflow-hidden p-0'>
      <CardContent className='p-0'>
        <div className='h-[550px] w-full rounded-md'>
          <MapContainer
            center={mapCenter as [number, number]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; Seazr'
              url='https://tiles.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png'
            />

            <MarkerClusterGroup
              chunkedLoading
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
            >
              {locations.map((vessel, index) => (
                <Marker
                  key={vessel.vesselId || `vessel-${index}`}
                  position={[vessel.latitude, vessel.longitude]}
                >
                  <Popup>
                    <div className='text-center'>
                      <strong>
                        {vessel.vesselName || `Vessel ${index + 1}`}
                      </strong>
                      <br />
                      <span className='text-muted-foreground text-sm'>
                        {vessel.latitude.toFixed(4)},{' '}
                        {vessel.longitude.toFixed(4)}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>

            {locations.length === 0 && (
              <div className='absolute top-1/2 left-1/2 z-[1000] -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white p-3 text-center shadow-lg'>
                No vessel locations available
              </div>
            )}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
