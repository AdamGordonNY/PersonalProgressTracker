"use client";

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export function PracticeTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveSession = () => {
    // Save practice session
    toast({
      title: "Session Saved",
      description: `Practice session of ${formatTime(seconds)} has been logged.`,
    });
    setSeconds(0);
    setIsRunning(false);
  };

  return (
    <Card className="p-4">
      <h2 className="mb-4 font-semibold">Practice Timer</h2>
      <div className="mb-4 text-center">
        <div className="mb-2 text-4xl font-bold font-mono">
          {formatTime(seconds)}
        </div>
        <Progress value={(seconds % 3600) / 36} className="h-2" />
      </div>
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setSeconds(0);
            setIsRunning(false);
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant={isRunning ? "destructive" : "default"}
          size="icon"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleSaveSession}
          disabled={seconds === 0}
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}