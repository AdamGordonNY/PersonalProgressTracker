"use client";

import { useState, useEffect } from "react";
import { FileText, Folder, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface DriveItem {
  id: string;
  name: string;
  webUrl: string;
  folder?: { childCount: number };
  file?: { mimeType: string };
}

export function OneDriveBrowser() {
  const [items, setItems] = useState<DriveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/cloud-storage/onedrive");
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setItems(data.value);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load OneDrive files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">OneDrive Files</h2>
        <p className="text-muted-foreground">Browse your OneDrive files</p>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {item.folder ? (
                    <Folder className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-blue-500" />
                  )}
                  <span className="font-medium">{item.name}</span>
                </div>
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <a
                    href={item.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              {item.folder && (
                <p className="text-sm text-muted-foreground">
                  {item.folder.childCount} items
                </p>
              )}
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full flex h-40 items-center justify-center text-center text-muted-foreground">
              No files found
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
