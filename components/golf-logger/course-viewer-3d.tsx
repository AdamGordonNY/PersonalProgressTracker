// src/components/golf/CourseViewer3D.tsx
"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { useThreeJsContext } from "@/context/threejs-context";

export function CourseViewer3D({ kmlData }: { kmlData: any }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const { initThreeJsScene } = useThreeJsContext();

  useEffect(() => {
    if (!kmlData || !mapRef.current) return;

    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
        libraries: ["maps", "visualization"],
      });

      const google = await loader.load();
      const map = new google.maps.Map(mapRef.current!, {
        tilt: 45, // Enable 3D view
        heading: 0,
        zoom: 16,
        center: kmlData.holes[0]?.path[0] || { lat: 0, lng: 0 },
        mapTypeId: "satellite",
        streetViewControl: false,
      });

      // Add KML layer
      const kmlLayer = new google.maps.KmlLayer({
        url: `data:application/vnd.google-earth.kml+xml;charset=UTF-8,${encodeURIComponent(kmlData.rawKml)}`,
        map: map,
        preserveViewport: true,
      });

      // Initialize Three.js overlay
      initThreeJsScene(map, kmlData);
    };

    initMap();
  }, [kmlData, initThreeJsScene]);

  return (
    <div className="relative h-[70vh] w-full">
      <div ref={mapRef} className="h-full w-full" />
      <div
        id="three-container"
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
