"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OneDriveBrowser } from "./onedrive-browser";
import { GoogleDriveBrowser } from "./google-drive-browser";

export function FileBrowser() {
  const [activeTab, setActiveTab] = useState("onedrive");

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="onedrive">OneDrive</TabsTrigger>
          <TabsTrigger value="google-drive">Google Drive</TabsTrigger>
        </TabsList>
        <TabsContent value="onedrive">
          <OneDriveBrowser />
        </TabsContent>
        <TabsContent value="google-drive">
          <GoogleDriveBrowser />
        </TabsContent>
      </Tabs>
    </div>
  );
}
