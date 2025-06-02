"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from "isomorphic-dompurify";

interface FeedDetailProps {
  feed: any;
  parsedFeed: any;
  fetchError: string | null;
}

export function FeedDetail({ feed, parsedFeed, fetchError }: FeedDetailProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Combine database entries with freshly parsed feed items
  const items = parsedFeed?.items || feed.entries;

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await fetch(`/api/feeds/${feed.id}/refresh`, { method: "POST" });
      window.location.reload();
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

  // Function to safely sanitize HTML content
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

  // Get content from item, handling different RSS formats
  const getItemContent = (item: any) => {
    return item["content:encoded"] || item.content || item.description || "";
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
            <p className="text-muted-foreground">{feed.url}</p>
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

      {fetchError && (
        <Card className="mb-6 border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          <CardContent className="p-4">
            <p>{fetchError}</p>
            <p className="mt-2 text-sm">Showing previously stored entries.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {items.length > 0 ? (
          items.map((item: any, index: number) => (
            <motion.div
              key={item.id || item.guid || item.link || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{item.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDate(
                            item.pubDate ||
                              item.published ||
                              new Date().toISOString()
                          )}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={item.link}
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
                      __html: sanitizeContent(getItemContent(item)),
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
              This feed doesn&apos;t have any entries yet or may be invalid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
