"use client";

import { useState, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Award, Target, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HabitList } from "@/components/habits/habit-list";
import { AddHabitDialog } from "@/components/habits/add-habit-dialog";
import { RewardsShop } from "@/components/habits/rewards-shop";
import { PriorityPyramid } from "@/components/habits/priority-pyramid";
import { useSession } from "@clerk/nextjs";

export function HabitTracker() {
  const session = useSession();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRewardsShop, setShowRewardsShop] = useState(false);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);

  useEffect(() => {
    // Fetch user data, habits, and stats
    // This would be replaced with actual API calls
    setCoins(150);
    setStreak(5);
    setWeeklyProgress(75);
  }, []);

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
          <HabitList />
        </div>
        <div>
          <PriorityPyramid />
        </div>
      </div>

      <AddHabitDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

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
