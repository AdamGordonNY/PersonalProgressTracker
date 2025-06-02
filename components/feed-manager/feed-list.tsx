"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Rss, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Feed } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export function FeedList() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      const response = await fetch("/api/feeds");
      if (!response.ok) throw new Error("Failed to fetch feeds");
      const data = await response.json();
      setFeeds(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load feeds",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFeed = async (feedId: string) => {
    try {
      const response = await fetch(`/api/feeds/${feedId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete feed");
      setFeeds(feeds.filter((feed) => feed.id !== feedId));
      toast({
        title: "Success",
        description: "Feed deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete feed",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feeds.map((feed) => (
        <motion.div
          key={feed.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  <Rss className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">
                    {feed.title || "Untitled Feed"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feed.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link
                    href={`/feeds/${feed.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteFeed(feed.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {feed.entries && feed.entries.length > 0 && (
              <div className="mt-4">
                <Badge variant="secondary">
                  {feed.entries.length} recent entries
                </Badge>
              </div>
            )}
          </Card>
        </motion.div>
      ))}

      {feeds.length === 0 && (
        <div className="flex h-40 items-center justify-center text-center text-muted-foreground">
          No feeds added yet. Add your first Substack feed to get started.
        </div>
      )}
    </div>
  );
}
