"use client";

import { useEffect } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useUIStore } from "@/lib/store";
import { useUser } from "@clerk/nextjs";

interface WidgetManagerProps {
  children: React.ReactNode;
}

export function WidgetManager({ children }: WidgetManagerProps) {
  const { user } = useUser();
  const { focusFortress, timeGuardian, postureChecker, highestZIndex } =
    useUIStore();

  // Sync with server preferences on load
  useEffect(() => {
    const syncPreferences = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch("/api/user/preferences");
        if (response.ok) {
          const serverPreferences = await response.json();

          // If server has preferences, update local store
          if (Object.keys(serverPreferences).length > 0) {
            // Note: In a real implementation, you'd need to update the Zustand store
            // with the server data. For now, we'll sync from client to server.
          }
        }
      } catch (error) {
        console.error("Error syncing preferences:", error);
      }
    };

    syncPreferences();
  }, [user?.id]);

  // Sync to server when preferences change
  useEffect(() => {
    const syncToServer = async () => {
      if (!user?.id) return;

      try {
        await fetch("/api/user/preferences", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            focusFortress,
            timeGuardian,
            postureChecker,
            highestZIndex,
          }),
        });
      } catch (error) {
        console.error("Error saving preferences to server:", error);
      }
    };

    // Debounce the sync to avoid too many requests
    const timeout = setTimeout(syncToServer, 1000);
    return () => clearTimeout(timeout);
  }, [user?.id, focusFortress, timeGuardian, postureChecker, highestZIndex]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if Ctrl is pressed and no input is focused
      if (
        !event.ctrlKey ||
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const { toggleMinimized } = useUIStore.getState();

      switch (event.key) {
        case "1":
          event.preventDefault();
          toggleMinimized("focusFortress");
          break;
        case "2":
          event.preventDefault();
          toggleMinimized("timeGuardian");
          break;
        case "3":
          event.preventDefault();
          toggleMinimized("postureChecker");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    // Handle any global drag end logic if needed
    console.log("Widget drag ended:", event);
  };

  return <DndContext onDragEnd={handleDragEnd}>{children}</DndContext>;
}
