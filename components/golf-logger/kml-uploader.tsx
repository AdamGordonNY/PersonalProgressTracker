// src/components/golf/KmlUploader.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { processKml } from "@/lib/kmlProcessor";

export function KmlUploader({ onUpload }: { onUpload: (data: any) => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    setIsLoading(true);
    const file = e.target.files[0];

    try {
      const kmlData = await file.text();
      const processedData = processKml(kmlData);
      onUpload(processedData);
      toast.success("Course imported successfully");
    } catch (error) {
      toast.error("Failed to process KML file");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <input
        type="file"
        accept=".kml"
        onChange={handleFileChange}
        className="hidden"
        id="kml-upload"
      />
      <label htmlFor="kml-upload" className="cursor-pointer">
        <Button variant="outline" disabled={isLoading} asChild>
          <div>{isLoading ? "Processing..." : "Import KML Course"}</div>
        </Button>
      </label>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload KML files from golf course mapping software
      </p>
    </div>
  );
}
