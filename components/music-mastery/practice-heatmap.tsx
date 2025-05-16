"use client";

import { Card } from '@/components/ui/card';

export function PracticeHeatmap() {
  // Generate sample practice data
  const generatePracticeData = () => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 5; j++) {
        data.push({
          intensity: Math.floor(Math.random() * 4), // 0-3 for intensity levels
        });
      }
    }
    return data;
  };

  const practiceData = generatePracticeData();

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 1:
        return 'bg-zinc-300 dark:bg-zinc-700';
      case 2:
        return 'bg-zinc-500 dark:bg-zinc-500';
      case 3:
        return 'bg-zinc-700 dark:bg-zinc-300';
      default:
        return 'bg-zinc-100 dark:bg-zinc-900';
    }
  };

  return (
    <Card className="p-4">
      <h2 className="mb-4 font-semibold">Practice Heatmap</h2>
      <div className="grid grid-cols-7 gap-1">
        {practiceData.map((day, index) => (
          <div
            key={index}
            className={`h-8 rounded ${getIntensityColor(day.intensity)}`}
            title={`${day.intensity} hours of practice`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-3 w-3 rounded bg-zinc-300 dark:bg-zinc-700" />
          <div className="h-3 w-3 rounded bg-zinc-500" />
          <div className="h-3 w-3 rounded bg-zinc-700 dark:bg-zinc-300" />
        </div>
        <span>More</span>
      </div>
    </Card>
  );
}