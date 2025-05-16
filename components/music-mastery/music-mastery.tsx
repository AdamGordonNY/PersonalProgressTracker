"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Clock, Target, Mic, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PracticeTimer } from '@/components/music-mastery/practice-timer';
import { ProgressTracker } from '@/components/music-mastery/progress-tracker';
import { GoalsList } from '@/components/music-mastery/goals-list';
import { RecordingStudio } from '@/components/music-mastery/recording-studio';
import { PracticeHeatmap } from '@/components/music-mastery/practice-heatmap';

export function MusicMastery() {
  const [showRecordingStudio, setShowRecordingStudio] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Music Mastery</h1>
          <p className="text-muted-foreground">Track your musical journey</p>
        </div>
        <Button onClick={() => setShowRecordingStudio(true)} className="gap-2">
          <Mic className="h-4 w-4" />
          Record Session
        </Button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-4 text-white dark:from-zinc-800 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/10 p-2">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white/60">Total Practice Time</p>
              <p className="text-2xl font-bold">24h 30m</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-4 text-white dark:from-zinc-800 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/10 p-2">
              <Music className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white/60">Skills Mastered</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-4 text-white dark:from-zinc-800 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/10 p-2">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white/60">Goals Completed</p>
              <p className="text-2xl font-bold">8</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <PracticeTimer />
          <ProgressTracker />
        </div>
        <div className="space-y-6">
          <GoalsList />
          <PracticeHeatmap />
        </div>
      </div>

      {showRecordingStudio && (
        <RecordingStudio onClose={() => setShowRecordingStudio(false)} />
      )}
    </div>
  );
}