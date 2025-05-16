"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimeGuardianWarningProps {
  onClose: () => void;
  onReset: () => void;
}

export function TimeGuardianWarning({
  onClose,
  onReset,
}: TimeGuardianWarningProps) {
  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative mx-auto max-w-lg rounded-lg bg-card p-6 shadow-lg"
      >
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-2 text-red-600"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>
          <h2 className="mb-2 text-xl font-semibold">Time&apos;s Up!</h2>
          <p className="mb-4 text-muted-foreground">
            Take a moment to stretch, rest your eyes, and hydrate.
          </p>
          <div className="flex justify-center gap-2">
            <Button onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Start New Session
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
