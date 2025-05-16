"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bold as Golf, Flag, Map, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Scorecard } from '@/components/golf-logger/scorecard';
import { StatsDashboard } from '@/components/golf-logger/stats-dashboard';
import { CourseMap } from '@/components/golf-logger/course-map';
import { TipsSection } from '@/components/golf-logger/tips-section';

export function GolfLogger() {
  const [activeView, setActiveView] = useState<'scorecard' | 'stats' | 'map' | 'tips'>('scorecard');

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">Golf Round Logger</h1>
          <p className="text-muted-foreground">Track your progress, improve your game</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeView === 'scorecard' ? 'default' : 'outline'}
            onClick={() => setActiveView('scorecard')}
            className="gap-2"
          >
            <Golf className="h-4 w-4" />
            Scorecard
          </Button>
          <Button
            variant={activeView === 'stats' ? 'default' : 'outline'}
            onClick={() => setActiveView('stats')}
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            Stats
          </Button>
          <Button
            variant={activeView === 'map' ? 'default' : 'outline'}
            onClick={() => setActiveView('map')}
            className="gap-2"
          >
            <Map className="h-4 w-4" />
            Course Map
          </Button>
          <Button
            variant={activeView === 'tips' ? 'default' : 'outline'}
            onClick={() => setActiveView('tips')}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Tips
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {activeView === 'scorecard' && <Scorecard />}
        {activeView === 'stats' && <StatsDashboard />}
        {activeView === 'map' && <CourseMap />}
        {activeView === 'tips' && <TipsSection />}
      </div>
    </div>
  );
}