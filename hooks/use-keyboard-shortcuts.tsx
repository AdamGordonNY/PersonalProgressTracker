"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/store";

export function useKeyboardShortcuts() {
  const { toggleMinimized } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if Ctrl is pressed and no input is focused
      if (
        !event.ctrlKey ||
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement instanceof HTMLElement &&
          document.activeElement.contentEditable === "true")
      ) {
        return;
      }

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
  }, [toggleMinimized]);
}
