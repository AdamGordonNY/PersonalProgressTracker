"use client";

import { useState, useEffect } from "react";
import { FileText, Folder, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
}

export function GoogleDriveBrowser() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch("/api/cloud-storage/google-drive");
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load Google Drive files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Google Drive Files</h2>
        <p className="text-muted-foreground">Browse your Google Drive files</p>
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
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {file.mimeType === "application/vnd.google-apps.folder" ? (
                    <Folder className="h-5 w-5 text-blue-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-blue-500" />
                  )}
                  <span className="font-medium">{file.name}</span>
                </div>
                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {file.mimeType.split(".").pop()}
              </p>
            </div>
          ))}

          {filteredFiles.length === 0 && (
            <div className="col-span-full flex h-40 items-center justify-center text-center text-muted-foreground">
              No files found
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
