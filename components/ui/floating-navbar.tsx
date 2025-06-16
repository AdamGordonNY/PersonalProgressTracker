"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { getUserFeatures } from "@/actions/user";
import {
  Layers,
  Bold as Golf,
  Clock,
  ArrowUpCircle,
  RssIcon,
  Cloud,
  ClipboardList,
  CheckSquare,
  Music2Icon,
  Home,
  Settings,
} from "lucide-react";

interface Route {
  path: string;
  label: string;
  icon: React.ReactNode;
  featureKey?: string;
}

export function FloatingNavbar() {
  const pathname = usePathname();
  const { isLoaded, user } = useUser();
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Define all possible routes
  const routes: Route[] = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      path: "/golf",
      label: "Golf",
      icon: <Golf className="h-4 w-4" />,
      featureKey: "golf_tracker",
    },
    {
      path: "/habits",
      label: "Habits",
      icon: <CheckSquare className="h-4 w-4" />,
      featureKey: "habit_tracker",
    },
    {
      path: "/posture",
      label: "Posture",
      icon: <ArrowUpCircle className="h-4 w-4" />,
      featureKey: "posture_reminder",
    },
    {
      path: "/feeds",
      label: "Feeds",
      icon: <RssIcon className="h-4 w-4" />,
      featureKey: "rss_feeds",
    },
    {
      path: "/cloud",
      label: "Cloud",
      icon: <Cloud className="h-4 w-4" />,
      featureKey: "cloud_storage",
    },
    {
      path: "/questionnaires",
      label: "Questionnaires",
      icon: <ClipboardList className="h-4 w-4" />,
      featureKey: "questionnaires",
    },
    {
      path: "/music-mastery",
      label: "Music",
      icon: <Music2Icon className="h-4 w-4" />,
      featureKey: "music_mastery",
    },
    {
      path: "/settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  useEffect(() => {
    const fetchFeatures = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const result = await getUserFeatures(user.id);
        if (result.features && typeof result.features === "object") {
          setFeatures({
            content_board: true, // Core feature is always enabled
            ...result.features,
          });
        } else {
          setFeatures({
            content_board: true, // Core feature is always enabled
          });
        }
      } catch (error) {
        console.error("Error fetching user features:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchFeatures();
    }
  }, [user, isLoaded]);

  // Filter routes based on enabled features
  const availableRoutes = routes.filter((route) => {
    // If no feature key is specified, always show the route
    if (!route.featureKey) return true;

    // Otherwise, only show if the feature is enabled
    return features[route.featureKey];
  });

  // Skip rendering during loading or on privacy/terms pages
  if (
    isLoading ||
    pathname.includes("/privacy") ||
    pathname.includes("/terms")
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center gap-1 rounded-full border bg-background/80 p-1.5 shadow-lg backdrop-blur-md"
      >
        {availableRoutes.map((route) => {
          const isActive =
            pathname === route.path || pathname.startsWith(`${route.path}/`);

          return (
            <Link href={route.path} key={route.path}>
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-full p-2 transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {route.icon}
                <span className="sr-only">{route.label}</span>

                {/* Tooltip */}
                <div className="absolute -top-9 hidden translate-y-0 whitespace-nowrap rounded-md bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-lg group-hover:block">
                  {route.label}
                </div>
              </div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
