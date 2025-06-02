"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { parseISO, format } from "date-fns";
import {
  Rss,
  RefreshCw,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from "isomorphic-dompurify";
import { useState } from "react";

interface Feed {
  id: string;
  title: string | null;
  url: string;
  entries: {
    id: string;
    title: string;
    content: string;
    url: string;
    published: string; // ISO string
  }[];
  createdAt: string;
  updatedAt: string;
  lastChecked: string;
}

interface FeedDetailProps {
  feed: Feed;
}

export function FeedDetail({ feed }: FeedDetailProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/feeds/${feed.id}/refresh`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Feed refreshed",
          description: "Reloading to show new content...",
        });
        // Reload after a short delay to show the toast
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error("Failed to refresh feed");
      }
    } catch (error) {
      console.error("Error refreshing feed:", error);
      toast({
        title: "Error",
        description: "Failed to refresh feed. Please try again.",
        variant: "destructive",
      });
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (e) {
      return format(new Date(dateString), "MMM d, yyyy");
    }
  };

  const sanitizeContent = (content: string) => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "p",
        "b",
        "i",
        "em",
        "strong",
        "a",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "br",
        "blockquote",
      ],
      ALLOWED_ATTR: ["href", "target", "rel"],
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/feeds">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{feed.title || "RSS Feed"}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{feed.url}</span>
              <span>•</span>
              <span>Last checked: {formatDate(feed.lastChecked)}</span>
            </div>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {feed.entries.length > 0 ? (
          feed.entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{entry.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(entry.published)}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeContent(entry.content),
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Rss className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-medium">No entries found</h2>
            <p className="mt-2 text-muted-foreground">
              This feed doesn&apos;t have any entries yet. Try refreshing.
            </p>
            <Button
              onClick={handleRefresh}
              className="mt-4"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh Feed
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
