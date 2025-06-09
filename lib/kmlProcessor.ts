// src/lib/kmlProcessor.ts

export function processKml(kmlData: string) {
  // Parse KML to GeoJSON
  const parser = new DOMParser();
  const kmlDoc = parser.parseFromString(kmlData, "text/xml");

  // Convert to Three.js compatible format
  const courseData = convertKmlToThree(kmlDoc);

  return {
    terrain: courseData.terrain,
    holes: courseData.holes,
    hazards: courseData.hazards,
  };
}

function convertKmlToThree(kmlDoc: Document) {
  // Extract placemarks for holes, hazards, etc.
  const placemarks = kmlDoc.getElementsByTagName("Placemark");
  const features = [];

  for (let i = 0; i < placemarks.length; i++) {
    const placemark = placemarks[i];
    const name = placemark.getElementsByTagName("name")[0]?.textContent || "";
    const coordinates =
      placemark.getElementsByTagName("coordinates")[0]?.textContent || "";

    features.push({
      type: name.includes("Hole") ? "hole" : "hazard",
      name,
      path: coordinates.split(" ").map((coord) => {
        const [lng, lat] = coord.split(",").map(Number);
        return { lat, lng };
      }),
    });
  }

  // Extract terrain data
  const groundOverlays = kmlDoc.getElementsByTagName("GroundOverlay");
  let terrainUrl = "";

  if (groundOverlays.length > 0) {
    const icon = groundOverlays[0].getElementsByTagName("Icon")[0];
    terrainUrl = icon.getElementsByTagName("href")[0]?.textContent || "";
  }

  return {
    terrain: terrainUrl,
    holes: features.filter((f) => f.type === "hole"),
    hazards: features.filter((f) => f.type === "hazard"),
  };
}
