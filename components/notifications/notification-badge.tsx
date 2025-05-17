"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const checkBadgeCount = async () => {
      try {
        const response = await fetch("/api/notifications/count");
        if (response.ok) {
          const data = await response.json();
          setCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    // Initial check
    checkBadgeCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(checkBadgeCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -right-2 -top-2"
          >
            <Badge variant="destructive" className="h-5 min-w-[20px] px-1">
              {count}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
