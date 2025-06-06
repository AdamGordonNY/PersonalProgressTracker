"use client";

import { useState } from "react";
import { ArrowUpCircle, Settings, Activity, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FloatingWidget } from "../floating-widgets/floating-widget";
import { usePostureAlarm } from "@/hooks/use-posture-alarm";
import { PostureReminderUI } from "@/components/posture-reminder/posture-reminder-ui";
import { PostureNotification } from "@/components/posture-reminder/posture-notification";

interface PostureCheckerWidgetProps {
  onClose?: () => void;
}

export function PostureCheckerWidget({ onClose }: PostureCheckerWidgetProps) {
  const { state, settings, startReminders, stopReminders, getPainLogs } =
    usePostureAlarm();
  const [showSettings, setShowSettings] = useState(false);

  // Get recent pain data for display
  const recentLogs = getPainLogs(7);
  const averagePain = recentLogs.length
    ? recentLogs.reduce((sum, log) => sum + log.level, 0) / recentLogs.length
    : 0;

  const handleToggle = () => {
    if (state.isActive) {
      stopReminders();
    } else {
      startReminders();
    }
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const formatTimeUntilNextReminder = () => {
    if (!state.nextReminder) return "Not scheduled";

    const now = Date.now();
    const timeUntil = state.nextReminder - now;

    if (timeUntil <= 0) return "Due now";

    const minutes = Math.floor(timeUntil / 60000);
    const seconds = Math.floor((timeUntil % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <FloatingWidget
        id="postureChecker"
        title="Posture Guardian"
        icon={<ArrowUpCircle className="h-4 w-4" />}
        onClose={onClose}
        onSettings={handleSettings}
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="posture-active">Active</Label>
              <Switch
                id="posture-active"
                checked={state.isActive}
                onCheckedChange={handleToggle}
              />
            </div>

            {state.isActive && (
              <div className="rounded-md bg-muted p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Next reminder</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatTimeUntilNextReminder()}
                  </span>
                </div>
              </div>
            )}

            {state.snoozeUntil && state.snoozeUntil > Date.now() && (
              <div className="rounded-md bg-yellow-100 p-3 dark:bg-yellow-950">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-yellow-600 dark:text-yellow-400">
                    Snoozed until{" "}
                    {new Date(state.snoozeUntil).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}

            {recentLogs.length > 0 && (
              <div className="rounded-md bg-muted p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Avg. Pain (7d)
                  </span>
                  <span className="text-sm font-medium">
                    {averagePain.toFixed(1)}/10
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {state.isActive
                ? "Monitoring your posture"
                : "Click to start posture monitoring"}
            </p>
          </div>
        </div>
      </FloatingWidget>

      {/* Include the posture reminder notification system */}
      <PostureNotification />
    </>
  );
}
