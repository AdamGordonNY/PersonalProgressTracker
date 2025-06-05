"use client";

import { useState, useEffect } from "react";
import { usePostureAlarm } from "@/hooks/use-posture-alarm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ThumbsUp } from "lucide-react";

interface DetectedPosture {
  isGood: boolean;
  message: string;
}

// In a real app, this would use camera input with user permission
// This is a simplified mock implementation
export function PostureDetector() {
  const { logPain, settings } = usePostureAlarm();
  const [posture, setPosture] = useState<DetectedPosture | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Request camera permission
  const requestPermission = async () => {
    setIsLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Stop the stream immediately - we just needed to check permission
      stream.getTracks().forEach((track) => track.stop());

      setHasPermission(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      setHasPermission(false);
      setIsLoading(false);
    }
  };

  // Start posture detection
  const startDetection = () => {
    setIsActive(true);

    // In a real implementation, this would start analyzing camera input
    // Here we'll just simulate random posture detection
    simulatePostureDetection();
  };

  // Stop posture detection
  const stopDetection = () => {
    setIsActive(false);
    setPosture(null);
  };

  // Simulate posture detection with random results
  const simulatePostureDetection = () => {
    // Only continue if detection is active
    if (!isActive) return;

    // Generate a random posture result
    const rand = Math.random();

    if (rand < 0.7) {
      // 70% chance of good posture
      setPosture({
        isGood: true,
        message: "Your posture looks good!",
      });
    } else {
      // 30% chance of bad posture
      const issues = [
        "You're slouching forward",
        "Your shoulders are hunched",
        "Your head is tilted too far down",
        "You're leaning to one side",
        "You're sitting too close to the screen",
      ];
      const randomIssue = issues[Math.floor(Math.random() * issues.length)];

      setPosture({
        isGood: false,
        message: randomIssue,
      });
    }

    // Schedule the next detection
    setTimeout(simulatePostureDetection, 5000);
  };

  // Render based on permission state
  if (hasPermission === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Posture Detection</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-muted-foreground">
            Real-time posture detection using your camera can help identify
            issues early.
          </p>
          <Button onClick={requestPermission} disabled={isLoading}>
            {isLoading
              ? "Requesting permission..."
              : "Enable Posture Detection"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (hasPermission === false) {
    return (
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            Camera Permission Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Posture detection requires camera access. Please update your browser
            settings to allow camera access for this site.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Posture Detection</span>
          <Button
            variant={isActive ? "destructive" : "default"}
            size="sm"
            onClick={isActive ? stopDetection : startDetection}
          >
            {isActive ? "Stop" : "Start"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isActive ? (
          <div className="space-y-4">
            <div className="aspect-video rounded-lg border bg-muted flex items-center justify-center">
              {/* This would be a camera feed in a real implementation */}
              <p className="text-center text-muted-foreground">
                Camera feed would appear here
              </p>
            </div>

            {posture && (
              <div
                className={`rounded-md p-3 ${
                  posture.isGood
                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {posture.isGood ? (
                    <ThumbsUp className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <p>{posture.message}</p>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Note: This is a simulation. A real implementation would use
              computer vision to analyze your posture.
            </p>
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center text-center">
            <div className="max-w-xs">
              <p className="mb-2 text-muted-foreground">
                Click &quot;Start&quot; to activate the posture detector.
              </p>
              <p className="text-xs text-muted-foreground">
                It will analyze your sitting position and provide real-time
                feedback.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
