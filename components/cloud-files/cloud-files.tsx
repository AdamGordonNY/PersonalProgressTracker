"use client";

import { useState } from "react";
import { FileBrowser } from "@/components/cloud-storage/file-browser";
import { Folder, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CloudFiles() {
  const [activeProvider, setActiveProvider] = useState<"google" | "onedrive">(
    "google"
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cloud Files</h1>
          <p className="text-muted-foreground">
            Access your files from Google Drive and OneDrive
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeProvider === "google" ? "default" : "outline"}
            onClick={() => setActiveProvider("google")}
            className="gap-2"
          >
            <Cloud className="h-4 w-4" />
            Google Drive
          </Button>
          <Button
            variant={activeProvider === "onedrive" ? "default" : "outline"}
            onClick={() => setActiveProvider("onedrive")}
            className="gap-2"
          >
            <Folder className="h-4 w-4" />
            OneDrive
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <FileBrowser />
      </Card>
    </div>
  );
}
