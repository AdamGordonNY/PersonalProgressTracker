"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Award, CheckCircle2, Circle, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data - replace with actual API data
const mockHabits = [
  {
    id: "1",
    name: "Morning Meditation",
    description: "Start the day with 10 minutes of mindfulness",
    priority: "IMPORTANT",
    coins: 15,
    completed: false,
    location: "Home",
    timeOfDay: "08:00",
  },
  {
    id: "2",
    name: "Fact-Checking Time",
    description: "Verify sources for upcoming content",
    priority: "CRITICAL",
    coins: 20,
    completed: true,
    location: "Office",
    timeOfDay: "10:00",
  },
];

export function HabitList() {
  const [habits, setHabits] = useState(mockHabits);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "IMPORTANT":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300";
    }
  };

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Today&apos;s Habits</h2>
      {habits.map((habit) => (
        <motion.div
          key={habit.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="overflow-hidden">
            <div className="flex items-start gap-4 p-4">
              <button
                onClick={() => toggleHabit(habit.id)}
                className="mt-1 text-muted-foreground transition-colors hover:text-primary"
              >
                {habit.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
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
                <div className="mt-2 flex gap-2">
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
                      {habit.timeOfDay}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
