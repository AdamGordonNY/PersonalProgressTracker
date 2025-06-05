"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  PostureSettings,
  PostureState,
  PainLog,
  PainLocation,
  PostureAlarmHook,
} from "@/lib/types";
import { isWithinInterval, set, getDay } from "date-fns";
import { v4 as uuidv4 } from "uuid";

// Default settings
const DEFAULT_SETTINGS: PostureSettings = {
  enabled: true,
  interval: 30, // 30 minutes
  workStartHour: 9, // 9am
  workEndHour: 17, // 5pm
  workDays: [1, 2, 3, 4, 5], // Monday-Friday
  soundEnabled: true,
  soundVolume: 0.5,
  notificationsEnabled: true,
  autoPauseInMeetings: true,
  autoPauseDuringFocus: true,
  snoozeOptions: [5, 15, 30, 60], // 5min, 15min, 30min, 1hr
};

// Default state
const DEFAULT_STATE: PostureState = {
  isActive: false,
  lastReminder: null,
  nextReminder: null,
  snoozeUntil: null,
  inMeeting: false,
  inFocusMode: false,
  painLogs: [],
};

/**
 * Custom hook for managing posture reminders
 */
export function usePostureAlarm(): PostureAlarmHook {
  // State
  const [settings, setSettings] = useState<PostureSettings>(DEFAULT_SETTINGS);
  const [state, setState] = useState<PostureState>(DEFAULT_STATE);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationRef = useRef<Notification | null>(null);

  // Load settings and state from localStorage on mount
  useEffect(() => {
    // Load settings
    const savedSettings = localStorage.getItem("postureSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error parsing saved posture settings:", error);
        // If there's an error, use default settings
        setSettings(DEFAULT_SETTINGS);
      }
    }

    // Load state
    const savedState = localStorage.getItem("postureState");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setState({
          ...parsedState,
          // Always start as inactive when the app loads
          isActive: false,
        });
      } catch (error) {
        console.error("Error parsing saved posture state:", error);
        // If there's an error, use default state
        setState(DEFAULT_STATE);
      }
    }

    // Initialize audio
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/gentle-chime.mp3");
      if (audioRef.current) {
        audioRef.current.volume = settings.soundVolume;
      }
    }

    // Request notification permission if needed
    if (
      settings.notificationsEnabled &&
      typeof window !== "undefined" &&
      "Notification" in window
    ) {
      if (
        Notification.permission !== "granted" &&
        Notification.permission !== "denied"
      ) {
        Notification.requestPermission();
      }
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (notificationRef.current) {
        notificationRef.current.close();
      }
    };
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("postureSettings", JSON.stringify(settings));

    // Update audio volume if it exists
    if (audioRef.current) {
      audioRef.current.volume = settings.soundVolume;
    }
  }, [settings]);

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("postureState", JSON.stringify(state));
  }, [state]);

  // Check if the current time is within work hours
  const isWorkHours = useCallback(() => {
    const now = new Date();
    const currentDay = getDay(now); // 0-6, where 0 is Sunday

    // Check if today is a workday
    if (!settings.workDays.includes(currentDay)) {
      return false;
    }

    // Create date objects for start and end of work hours today
    const startTime = set(now, {
      hours: settings.workStartHour,
      minutes: 0,
      seconds: 0,
    });
    const endTime = set(now, {
      hours: settings.workEndHour,
      minutes: 0,
      seconds: 0,
    });

    // Check if current time is within work hours
    return isWithinInterval(now, { start: startTime, end: endTime });
  }, [settings.workDays, settings.workStartHour, settings.workEndHour]);

  // Check if reminders should be paused
  const shouldPauseReminders = useCallback(() => {
    // Check if reminders are snoozed
    if (state.snoozeUntil && Date.now() < state.snoozeUntil) {
      return true;
    }

    // Check if we should pause during meetings
    if (settings.autoPauseInMeetings && state.inMeeting) {
      return true;
    }

    // Check if we should pause during focus mode
    if (settings.autoPauseDuringFocus && state.inFocusMode) {
      return true;
    }

    // Check if we're outside work hours
    if (!isWorkHours()) {
      return true;
    }

    return false;
  }, [
    state.snoozeUntil,
    state.inMeeting,
    state.inFocusMode,
    settings.autoPauseInMeetings,
    settings.autoPauseDuringFocus,
    isWorkHours,
  ]);

  // Schedule the next reminder
  const scheduleNextReminder = useCallback(() => {
    if (!settings.enabled || shouldPauseReminders()) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Update state to reflect that reminders are not active
      setState((prev) => ({
        ...prev,
        isActive: false,
        nextReminder: null,
      }));

      return;
    }

    // Calculate when the next reminder should be
    const now = Date.now();
    const nextReminderTime = state.lastReminder
      ? state.lastReminder + settings.interval * 60 * 1000
      : now + settings.interval * 60 * 1000;

    // Update state with next reminder time
    setState((prev) => ({
      ...prev,
      isActive: true,
      nextReminder: nextReminderTime,
    }));

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set the timer for the next reminder
    const timeUntilNextReminder = nextReminderTime - now;
    timerRef.current = setTimeout(triggerReminder, timeUntilNextReminder);
  }, [
    settings.enabled,
    settings.interval,
    state.lastReminder,
    shouldPauseReminders,
  ]);

  // Trigger a posture reminder
  const triggerReminder = useCallback(() => {
    // Play sound if enabled
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing sound:", error);
      });
    }

    // Show notification if enabled
    if (
      settings.notificationsEnabled &&
      typeof window !== "undefined" &&
      "Notification" in window
    ) {
      if (Notification.permission === "granted") {
        // Close any existing notification
        if (notificationRef.current) {
          notificationRef.current.close();
        }

        // Create a new notification
        notificationRef.current = new Notification("Posture Check", {
          body: "Time to check your posture. Sit up straight and adjust your position.",
          icon: "/images/posture-icon.png", // You'll need to create this icon
          silent: true, // We're using our own sound
        });

        // Auto-close the notification after 10 seconds
        setTimeout(() => {
          if (notificationRef.current) {
            notificationRef.current.close();
            notificationRef.current = null;
          }
        }, 10000);
      }
    }

    // Update state
    setState((prev) => ({
      ...prev,
      lastReminder: Date.now(),
      nextReminder: null,
    }));

    // Schedule the next reminder
    scheduleNextReminder();
  }, [
    settings.soundEnabled,
    settings.notificationsEnabled,
    scheduleNextReminder,
  ]);

  // Start the reminders
  const startReminders = useCallback(() => {
    if (!settings.enabled) {
      setSettings((prev) => ({ ...prev, enabled: true }));
    }

    setState((prev) => ({
      ...prev,
      isActive: true,
      lastReminder: null,
      snoozeUntil: null,
    }));

    // Schedule the first reminder
    scheduleNextReminder();
  }, [settings.enabled, scheduleNextReminder]);

  // Stop the reminders
  const stopReminders = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Update state to reflect that reminders are not active
    setState((prev) => ({
      ...prev,
      isActive: false,
      nextReminder: null,
    }));
  }, []);

  // Snooze reminders for a specific duration
  const snooze = useCallback(
    (minutes: number) => {
      const snoozeUntil = Date.now() + minutes * 60 * 1000;

      setState((prev) => ({
        ...prev,
        snoozeUntil,
      }));

      // Reschedule reminders
      scheduleNextReminder();
    },
    [scheduleNextReminder]
  );

  // Log pain level
  const logPain = useCallback(
    (level: number, location: PainLocation, notes?: string) => {
      const newPainLog: PainLog = {
        id: uuidv4(),
        timestamp: Date.now(),
        level,
        location,
        notes,
      };

      setState((prev) => ({
        ...prev,
        painLogs: [...prev.painLogs, newPainLog],
      }));
    },
    []
  );

  // Clear all pain logs
  const clearLogs = useCallback(() => {
    setState((prev) => ({
      ...prev,
      painLogs: [],
    }));
  }, []);

  // Get pain logs for a specific number of days
  const getPainLogs = useCallback(
    (days = 7) => {
      const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
      return state.painLogs.filter((log) => log.timestamp >= cutoffTime);
    },
    [state.painLogs]
  );

  // Dismiss the current reminder
  const dismissReminder = useCallback(() => {
    if (notificationRef.current) {
      notificationRef.current.close();
      notificationRef.current = null;
    }

    // Schedule the next reminder
    scheduleNextReminder();
  }, [scheduleNextReminder]);

  // Set meeting status
  const setInMeeting = useCallback(
    (inMeeting: boolean) => {
      setState((prev) => ({
        ...prev,
        inMeeting,
      }));

      // Reschedule reminders based on new status
      scheduleNextReminder();
    },
    [scheduleNextReminder]
  );

  // Set focus mode status
  const setInFocusMode = useCallback(
    (inFocusMode: boolean) => {
      setState((prev) => ({
        ...prev,
        inFocusMode,
      }));

      // Reschedule reminders based on new status
      scheduleNextReminder();
    },
    [scheduleNextReminder]
  );

  // Update settings
  const updateSettings = useCallback(
    (newSettings: Partial<PostureSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };

        // If we changed the sound volume, update the audio element
        if ("soundVolume" in newSettings && audioRef.current) {
          audioRef.current.volume = updated.soundVolume;
        }

        return updated;
      });

      // Reschedule reminders based on new settings
      scheduleNextReminder();
    },
    [scheduleNextReminder]
  );

  // Run the scheduler when dependencies change
  useEffect(() => {
    // Start the scheduler if enabled and not already running
    if (settings.enabled && !timerRef.current) {
      scheduleNextReminder();
    }
    // Stop the scheduler if disabled and currently running
    else if (!settings.enabled && timerRef.current) {
      stopReminders();
    }
  }, [
    settings.enabled,
    settings.interval,
    state.inMeeting,
    state.inFocusMode,
    state.snoozeUntil,
    scheduleNextReminder,
    stopReminders,
  ]);

  // Return the hook interface
  return {
    settings,
    state,
    updateSettings,
    startReminders,
    stopReminders,
    snooze,
    logPain,
    clearLogs,
    getPainLogs,
    dismissReminder,
    setInMeeting,
    setInFocusMode,
  };
}
