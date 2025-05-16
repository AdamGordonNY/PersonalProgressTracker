"use client";

import { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 40.7128,
  lng: -74.0060
};

export function CourseMap() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Card className="p-6">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search for a golf course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
          >
            <Marker position={center} />
          </GoogleMap>
        </LoadScript>
      </div>
    </Card>
  );
}