"use client";

import { useEffect, useState, useRef } from "react";
import { usePostureAlarm } from "@/hooks/use-posture-alarm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
export function PostureNotification() {
  const { settings, state, snooze, dismissReminder } = usePostureAlarm();

  const [showAlert, setShowAlert] = useState(false);
  const lastReminderRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/gentle-chime.mp3");
      if (audioRef.current && settings) {
        audioRef.current.volume = settings.soundVolume;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [settings]);

  // Show notification when a new reminder is triggered
  useEffect(() => {
    // Check if there's a new reminder
    if (state.lastReminder && state.lastReminder !== lastReminderRef.current) {
      // Update the ref so we don't trigger again for the same reminder
      lastReminderRef.current = state.lastReminder;

      // Show the alert dialog
      setShowAlert(true);

      // Play sound if enabled
      if (settings.soundEnabled && audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing sound:", error);
        });
      }
    }
  }, [state.lastReminder, settings.soundEnabled]);

  // Handle dismissing the notification
  const handleDismiss = () => {
    setShowAlert(false);
    dismissReminder();
  };

  // Handle snoozing
  const handleSnooze = (minutes: number) => {
    setShowAlert(false);
    snooze(minutes);
  };

  return (
    <>
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-500"
              >
                <path d="M4 16v-2.38C4 10.42 4.0 8.43 5.17 7.17S10.42 4 13.62 4h2.76c3.2 0 5.19 0 6.45 1.17S24 10.42 24 13.62v2.76c0 3.2 0 5.19-1.17 6.45S16.82 24 13.62 24h-2.76c-3.2 0-5.19 0-6.45-1.17S4 19.82 4 16.62V16Z"></path>
                <path d="m12 17-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9Z"></path>
              </svg>
              Posture Check!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Take a moment to adjust your posture. Sit up straight, relax your
              shoulders, and make sure your screen is at eye level.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-center py-4">
            <Image
              src="/images/posture-diagram.svg"
              alt="Proper sitting posture diagram"
              className="h-32"
            />
          </div>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <div className="flex flex-wrap gap-2 sm:flex-1 sm:justify-start">
              {settings.snoozeOptions.slice(0, 3).map((minutes) => (
                <Button
                  key={minutes}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSnooze(minutes)}
                >
                  Snooze {minutes}m
                </Button>
              ))}
            </div>
            <Button className="sm:flex-1" onClick={handleDismiss}>
              I&apos;ve Fixed My Posture
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
