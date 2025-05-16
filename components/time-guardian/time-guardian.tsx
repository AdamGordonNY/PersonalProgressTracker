"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Calendar, X, Play, Pause, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TimeGuardianCalendar } from '@/components/time-guardian/time-guardian-calendar';
import { TimeGuardianWarning } from '@/components/time-guardian/time-guardian-warning';

const DEFAULT_DURATION = 45 * 60; // 45 minutes in seconds

export function TimeGuardian() {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const progress = ((DEFAULT_DURATION - timeLeft) / DEFAULT_DURATION) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getTimerColor = () => {
    if (timeLeft < 300) return 'text-red-500'; // Less than 5 minutes
    if (timeLeft < 600) return 'text-amber-500'; // Less than 10 minutes
    return 'text-emerald-500';
  };

  const handleReset = useCallback(() => {
    setTimeLeft(DEFAULT_DURATION);
    setIsRunning(false);
    setShowWarning(false);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowWarning(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  return (
    <>
      <Card className="fixed bottom-4 right-4 w-64 shadow-lg">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              <h3 className="font-semibold">Time Guardian</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          <div className={`mb-4 text-center text-3xl font-bold ${getTimerColor()}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <Progress value={progress} className="mb-4" />

          <div className="flex justify-between gap-2">
            <Button
              variant={isRunning ? "destructive" : "default"}
              className="flex-1"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Start
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              className="h-9 w-9"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {showCalendar && (
          <TimeGuardianCalendar onClose={() => setShowCalendar(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWarning && (
          <TimeGuardianWarning onClose={() => setShowWarning(false)} onReset={handleReset} />
        )}
      </AnimatePresence>
    </>
  );
}