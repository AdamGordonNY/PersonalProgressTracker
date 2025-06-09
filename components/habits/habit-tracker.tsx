"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Award, Target, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { HabitList } from "@/components/habits/habit-list";
import { AddHabitDialog } from "@/components/habits/add-habit-dialog";
import { RewardsShop } from "@/components/habits/rewards-shop";
import { PriorityPyramid } from "@/components/habits/priority-pyramid";
import { useToast } from "@/hooks/use-toast";
import {
  getHabits,
  getUserCoins,
  completeHabit,
  getHabitCompletions,
} from "@/actions/habit";
import { Completion, Habit } from "@prisma/client";

type HabitWithCompletions = Habit & {
  completions: Completion[];
};

export function HabitTracker() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRewardsShop, setShowRewardsShop] = useState(false);
  const [habits, setHabits] = useState<HabitWithCompletions[]>([]);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch habits and user stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [habitsResult, coinsResult, completionsResult] =
          await Promise.all([
            getHabits(),
            getUserCoins(),
            getHabitCompletions(7), // Last 7 days
          ]);

        if ("habits" in habitsResult) {
          setHabits(habitsResult.habits as HabitWithCompletions[]);
        }

        if ("coins" in coinsResult) {
          setCoins(coinsResult.coins!);
        }

        // Calculate streak and progress
        if ("habits" in completionsResult) {
          calculateStreak(completionsResult.habits as HabitWithCompletions[]);
          calculateWeeklyProgress(
            completionsResult.habits as HabitWithCompletions[]
          );
        }
      } catch (error) {
        console.error("Error fetching habit data:", error);
        toast({
          title: "Error",
          description: "Failed to load habits",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calculate current streak
  const calculateStreak = (habitsWithCompletions: HabitWithCompletions[]) => {
    // This is a simplified implementation
    // A real implementation would count consecutive days with completions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if there were any completions today
    const todayCompletions = habitsWithCompletions.some((habit) =>
      habit.completions.some((completion) => {
        const completionDate = new Date(completion.date);
        completionDate.setHours(0, 0, 0, 0);
        return completionDate.getTime() === today.getTime();
      })
    );

    // Check if there were any completions yesterday
    const yesterdayCompletions = habitsWithCompletions.some((habit) =>
      habit.completions.some((completion) => {
        const completionDate = new Date(completion.date);
        completionDate.setHours(0, 0, 0, 0);
        return completionDate.getTime() === yesterday.getTime();
      })
    );

    // Very simple streak calculation
    if (todayCompletions) {
      setStreak(yesterdayCompletions ? 2 : 1);
    } else {
      setStreak(0);
    }
  };

  // Calculate weekly progress
  const calculateWeeklyProgress = (
    habitsWithCompletions: HabitWithCompletions[]
  ) => {
    const totalHabits = habitsWithCompletions.length * 7; // Total possible in a week
    if (totalHabits === 0) {
      setWeeklyProgress(0);
      return;
    }

    const completedHabits = habitsWithCompletions.reduce((total, habit) => {
      return total + habit.completions.length;
    }, 0);

    setWeeklyProgress(Math.round((completedHabits / totalHabits) * 100));
  };

  // Handle habit completion
  const handleCompleteHabit = async (habitId: string) => {
    try {
      const result = await completeHabit(habitId);

      if ("error" in result) {
        throw new Error(result.error);
      }

      // Update coins
      setCoins((prev) => prev + (result.coinsEarned || 0));

      // Refresh habits
      const refreshedHabits = await getHabits();
      if ("habits" in refreshedHabits) {
        setHabits(refreshedHabits.habits as HabitWithCompletions[]);
      }

      toast({
        title: "Habit Completed",
        description: `You earned ${result.coinsEarned} coins!`,
      });
    } catch (error) {
      console.error("Error completing habit:", error);
      toast({
        title: "Error",
        description: "Failed to complete habit",
        variant: "destructive",
      });
    }
  };

  const handleHabitCreated = async () => {
    // Refresh habits after creating a new one
    setIsLoading(true);
    try {
      const result = await getHabits();
      if ("habits" in result) {
        setHabits(result.habits as HabitWithCompletions[]);
      }
    } catch (error) {
      console.error("Error refreshing habits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Habit Tracker</h1>
          <p className="text-muted-foreground">
            Build better habits, earn rewards
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowRewardsShop(true)}
            variant="outline"
            className="gap-2"
          >
            <Award className="h-4 w-4" />
            <span>{coins} Coins</span>
          </Button>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Habit
          </Button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weekly Progress</p>
              <p className="text-2xl font-bold">{weeklyProgress}%</p>
            </div>
          </div>
          <Progress value={weeklyProgress} className="mt-3" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-bold">{streak} days</p>
            </div>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < streak ? "bg-amber-500" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Coins</p>
              <p className="text-2xl font-bold">{coins}</p>
            </div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Complete habits to earn more coins!
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HabitList
            habits={habits}
            isLoading={isLoading}
            onComplete={handleCompleteHabit}
          />
        </div>
        <div>
          <PriorityPyramid />
        </div>
      </div>

      <AddHabitDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onHabitCreated={handleHabitCreated}
      />

      <AnimatePresence>
        {showRewardsShop && (
          <RewardsShop
            coins={coins}
            onClose={() => setShowRewardsShop(false)}
            onPurchase={(cost) => setCoins(coins - cost)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
