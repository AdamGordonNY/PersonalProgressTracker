"use client";

import { useEffect, useState } from "react";
import { getUserFeatures } from "@/actions/user";
import { useUser } from "@clerk/nextjs";
import { WidgetManager } from "./widget-manager";
import { FocusFortressWidget } from "@/components/focus-fortress/focus-fortress-widget";
import { TimeGuardianWidget } from "@/components/time-guardian/time-guardian-widget";
import { PostureCheckerWidget } from "@/components/posture-reminder/posture-checker-widget";

export function FloatingWidgets() {
  const { user } = useUser();
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeWidgets, setActiveWidgets] = useState<Record<string, boolean>>({
    focusFortress: false,
    timeGuardian: false,
    postureChecker: false,
  });

  // Fetch user's feature preferences
  useEffect(() => {
    const fetchFeatures = async () => {
      if (!user?.id) return;

      try {
        const result = await getUserFeatures(user.id);
        if (!result.error) {
          setFeatures(result.features);
        }
      } catch (error) {
        console.error("Error fetching user features:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatures();
  }, [user?.id]);

  // Auto-show widgets based on features (optional - could be triggered by user action instead)
  useEffect(() => {
    if (!isLoading) {
      // Only auto-show if user has the features enabled
      // You might want to change this logic based on your UX preferences
      setActiveWidgets({
        focusFortress: false, // Don't auto-show, let user trigger
        timeGuardian: false, // Don't auto-show, let user trigger
        postureChecker: false, // Don't auto-show, let user trigger
      });
    }
  }, [features, isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <WidgetManager>
      {/* Focus Fortress Widget */}
      {features.time_guardian && activeWidgets.focusFortress && (
        <FocusFortressWidget
          onClose={() =>
            setActiveWidgets((prev) => ({ ...prev, focusFortress: false }))
          }
        />
      )}

      {/* Time Guardian Widget */}
      {features.time_guardian && activeWidgets.timeGuardian && (
        <TimeGuardianWidget
          onClose={() =>
            setActiveWidgets((prev) => ({ ...prev, timeGuardian: false }))
          }
        />
      )}

      {/* Posture Checker Widget */}
      {features.posture_reminder && activeWidgets.postureChecker && (
        <PostureCheckerWidget
          onClose={() =>
            setActiveWidgets((prev) => ({ ...prev, postureChecker: false }))
          }
        />
      )}
    </WidgetManager>
  );
}
