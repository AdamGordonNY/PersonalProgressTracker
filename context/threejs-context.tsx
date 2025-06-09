// src/context/threejs-context.tsx
"use client";

import { createContext, useContext, useRef } from "react";
import * as THREE from "three";

type ThreeJsContextType = {
  initThreeJsScene: (map: google.maps.Map, courseData: any) => void;
};

const ThreeJsContext = createContext<ThreeJsContextType | null>(null);

export function ThreeJsProvider({ children }: { children: React.ReactNode }) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const initThreeJsScene = (map: google.maps.Map, courseData: any) => {
    const container = document.getElementById("three-container");
    if (!container) return;

    // Initialize Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create golf course terrain
    const geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    const material = new THREE.MeshPhongMaterial({
      color: 0x2d6a4f,
      wireframe: false,
    });

    const terrain = new THREE.Mesh(geometry, material);
    scene.add(terrain);

    // Add course features
    courseData.holes.forEach((hole: any) => {
      const holeGeometry = new THREE.CylinderGeometry(2, 2, 1, 32);
      const holeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const holeMesh = new THREE.Mesh(holeGeometry, holeMaterial);

      // Position based on KML coordinates
      const position = latLngToVector3(hole.path[0], map);
      holeMesh.position.set(position.x, 1, position.z);
      scene.add(holeMesh);
    });

    // Save references
    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
  };

  const latLngToVector3 = (
    latLng: { lat: number; lng: number },
    map: google.maps.Map
  ) => {
    // Convert lat/lng to Three.js world coordinates
    const projection = map.getProjection();
    const point = projection?.fromLatLngToPoint(latLng);
    return new THREE.Vector3(
      (point?.x! - 0.5) * 1000,
      0,
      (point?.y! - 0.5) * 1000
    );
  };

  return (
    <ThreeJsContext.Provider value={{ initThreeJsScene }}>
      {children}
    </ThreeJsContext.Provider>
  );
}

export function useThreeJsContext() {
  const context = useContext(ThreeJsContext);
  if (!context) {
    throw new Error("useThreeJsContext must be used within a ThreeJsProvider");
  }
  return context;
}
