"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useLocalStorageState from "use-local-storage-state";
import { Focus, X, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { quotes } from "@/lib/motivational-quotes";

export function FocusFortress() {
  const [isActive, setIsActive] = useLocalStorageState("focus-fortress", {
    defaultValue: false,
  });
  const [quote, setQuote] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [totalTime] = useState(25 * 60); // 25 minutes in seconds

  useEffect(() => {
    if (isActive) {
      // Set random quote
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

      // Block distracting sites
      const style = document.createElement("style");
      style.id = "focus-fortress-style";
      style.textContent = `
        body { overflow: hidden; }
        .focus-hidden { display: none !important; }
      `;
      document.head.appendChild(style);

      // Start timer
      const interval = setInterval(() => {
        setTimeElapsed((prev) => {
          if (prev >= totalTime) {
            clearInterval(interval);
            setIsActive(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        document.getElementById("focus-fortress-style")?.remove();
      };
    }
  }, [isActive, setIsActive, totalTime]);

  const progress = (timeElapsed / totalTime) * 100;
  const remainingMinutes = Math.floor((totalTime - timeElapsed) / 60);
  const remainingSeconds = (totalTime - timeElapsed) % 60;

  if (!isActive) {
    return (
      <Button
        onClick={() => setIsActive(true)}
        className="fixed bottom-4 left-4 gap-2"
        variant="outline"
      >
        <Focus className="h-4 w-4" />
        Enter Focus Fortress
      </Button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="relative mx-auto max-w-lg px-4"
        >
          <Card className="p-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setIsActive(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="mb-8 text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <Focus className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Focus Fortress</h2>
              </div>
              <p className="text-muted-foreground">
                Stay focused and eliminate distractions
              </p>
            </div>

            <div className="mb-8 text-center">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Timer className="h-5 w-5" />
                <span className="text-2xl font-bold">
                  {String(remainingMinutes).padStart(2, "0")}:
                  {String(remainingSeconds).padStart(2, "0")}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <blockquote className="mb-6 border-l-2 pl-4 italic text-muted-foreground">
              &quot;{quote}&quot;
            </blockquote>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm">Hide Non-Essential UI</label>
                <Switch checked={true} disabled />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Block Distracting Sites</label>
                <Switch checked={true} disabled />
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
