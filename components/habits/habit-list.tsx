"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Award, CheckCircle2, Circle, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Priority, Habit, Completion } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";

interface HabitWithCompletions extends Habit {
  completions: Completion[];
}

interface HabitListProps {
  habits: HabitWithCompletions[];
  isLoading: boolean;
  onComplete: (id: string) => Promise<void>;
}

export function HabitList({ habits, isLoading, onComplete }: HabitListProps) {
  // Track which habits are being processed
  const [processingHabits, setProcessingHabits] = useState<
    Record<string, boolean>
  >({});

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL:
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case Priority.IMPORTANT:
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
    }
  };

  const handleToggleHabit = async (id: string) => {
    // Check if already processing this habit
    if (processingHabits[id]) return;

    // Check if already completed
    if (isCompletedToday(habits.find((h) => h.id === id)!)) return;

    // Mark as processing
    setProcessingHabits((prev) => ({ ...prev, [id]: true }));

    try {
      await onComplete(id);
    } finally {
      // Unmark as processing
      setProcessingHabits((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Check if habit was completed today
  const isCompletedToday = (habit: HabitWithCompletions) => {
    if (!habit.completions?.length) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return habit.completions.some((completion) => {
      const completionDate = new Date(completion.date);
      completionDate.setHours(0, 0, 0, 0);
      return completionDate.getTime() === today.getTime();
    });
  };

  // Format time
  const formatTimeOfDay = (timeOfDay: Date | null | undefined) => {
    if (!timeOfDay) return null;
    return new Date(timeOfDay).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Today&apos;s Habits</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Today&apos;s Habits</h2>
      {habits.length > 0 ? (
        habits.map((habit) => {
          const completed = isCompletedToday(habit);

          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card
                className={`overflow-hidden ${completed ? "border-l-4 border-l-green-500" : ""}`}
              >
                <div className="flex items-start gap-4 p-4">
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className="mt-1 text-muted-foreground transition-colors hover:text-primary"
                    disabled={processingHabits[habit.id] || completed}
                  >
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : processingHabits[habit.id] ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{habit.name}</h3>
                      <Badge variant="secondary" className="gap-1">
                        <Award className="h-3 w-3" />
                        {habit.coins}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {habit.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className={getPriorityColor(habit.priority)}
                      >
                        {habit.priority}
                      </Badge>
                      {habit.location && (
                        <Badge variant="outline" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {habit.location}
                        </Badge>
                      )}
                      {habit.timeOfDay && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeOfDay(habit.timeOfDay)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })
      ) : (
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <Award className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No habits yet</h3>
          <p className="mt-1 text-muted-foreground">
            Create your first habit to get started
          </p>
        </Card>
      )}
    </div>
  );
}
