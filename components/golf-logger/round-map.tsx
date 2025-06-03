"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";

interface RoundMapProps {
  round: any;
}

// Map container styles
const containerStyle = {
  width: "100%",
  height: "500px",
};

// Map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeId: "hybrid" as const,
};

export function RoundMap({ round }: RoundMapProps) {
  const [selectedShot, setSelectedShot] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [shotCoordinates, setShotCoordinates] = useState<any[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    // Extract shot coordinates from shots with valid lat/lng
    const validShots = round.shots
      .filter((shot: any) => shot.latitude && shot.longitude)
      .map((shot: any) => ({
        ...shot,
        position: {
          lat: shot.latitude,
          lng: shot.longitude,
        },
      }));

    setShotCoordinates(validShots);

    // Calculate map center based on shots
    if (validShots.length > 0) {
      // Find the center point of all shots
      const sumLat = validShots.reduce(
        (sum: number, shot: any) => sum + shot.latitude,
        0
      );
      const sumLng = validShots.reduce(
        (sum: number, shot: any) => sum + shot.longitude,
        0
      );

      setMapCenter({
        lat: sumLat / validShots.length,
        lng: sumLng / validShots.length,
      });
    } else {
      // Default center (could use course location if available)
      setMapCenter({ lat: 40.7128, lng: -74.006 });
    }
  }, [round.shots]);

  // Format shot type for display
  const formatShotType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Format club for display
  const formatClub = (club: string) => {
    return club
      .split("_")
      .map((word) => {
        if (
          [
            "TWO",
            "THREE",
            "FOUR",
            "FIVE",
            "SIX",
            "SEVEN",
            "EIGHT",
            "NINE",
          ].includes(word)
        ) {
          return word.charAt(0);
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ")
      .replace("Pitching Wedge", "PW")
      .replace("Gap Wedge", "GW")
      .replace("Sand Wedge", "SW")
      .replace("Lob Wedge", "LW");
  };

  const shotsByHole: Record<string, any[]> = round.shots.reduce(
    (acc: Record<string, any[]>, shot: any) => {
      if (!acc[shot.holeId]) {
        acc[shot.holeId] = [];
      }
      acc[shot.holeId].push(shot);
      return acc;
    },
    {}
  );

  // Create polylines for each hole
  const polylines = Object.entries(shotsByHole)
    .map(([holeId, shots]) => {
      const validShots = shots.filter(
        (shot) => shot.latitude && shot.longitude
      );

      if (validShots.length < 2) return null;

      return {
        holeId,
        path: validShots.map((shot) => ({
          lat: shot.latitude,
          lng: shot.longitude,
        })),
        options: {
          strokeColor: "#22c55e", // Emerald-500
          strokeOpacity: 0.8,
          strokeWeight: 3,
        },
      };
    })
    .filter(Boolean) as {
    holeId: string;
    path: { lat: number; lng: number }[];
    options: {
      strokeColor: string;
      strokeOpacity: number;
      strokeWeight: number;
    };
  }[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shot Map</CardTitle>
      </CardHeader>
      <CardContent>
        {shotCoordinates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12 text-center">
            <p className="text-muted-foreground">
              No shots with location data available for this round.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Use the shot tracker to capture shot locations on the course.
            </p>
          </div>
        ) : (
          <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
          >
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={17}
              options={mapOptions}
              onLoad={onLoad}
              onUnmount={onUnmount}
            >
              {/* Render the shot markers */}
              {shotCoordinates.map((shot) => (
                <Marker
                  key={shot.id}
                  position={shot.position}
                  onClick={() => setSelectedShot(shot)}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#22c55e",
                    fillOpacity: 0.8,
                    strokeColor: "#ffffff",
                    strokeWeight: 2,
                  }}
                />
              ))}

              {/* Render the polylines to connect shots */}
              {polylines.map((line: any, index) => (
                <Polyline
                  key={`${line.holeId}-${index}`}
                  path={line.path}
                  options={line.options}
                />
              ))}

              {/* Info window for selected shot */}
              {selectedShot && (
                <InfoWindow
                  position={selectedShot.position}
                  onCloseClick={() => setSelectedShot(null)}
                >
                  <div className="p-1">
                    <p className="font-bold">
                      {formatShotType(selectedShot.shotType)} -{" "}
                      {formatClub(selectedShot.club)}
                    </p>
                    <p className="text-sm">{selectedShot.distance} yards</p>
                    {selectedShot.result && (
                      <p className="text-sm">Result: {selectedShot.result}</p>
                    )}
                    {selectedShot.note && (
                      <p className="mt-1 text-sm italic">{selectedShot.note}</p>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        )}
      </CardContent>
    </Card>
  );
}
