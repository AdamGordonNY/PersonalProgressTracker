"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { FeedEntry } from "@/lib/types";
import { NotificationBadge } from "./notification-badge";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);

      // Reset badge count
      await fetch("/api/notifications/reset", { method: "POST" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <NotificationBadge />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed right-4 top-16 z-50 w-96"
          >
            <Card>
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="font-semibold">Notifications</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[400px]">
                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="p-4">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 rounded-lg border p-3"
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium">{notification.title}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                          >
                            <a
                              href={notification.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {new Date(
                            notification.published
                          ).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))}

                    {notifications.length === 0 && (
                      <div className="flex h-40 items-center justify-center text-center text-muted-foreground">
                        No new notifications
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
