"use client";

import { useState } from "react";
import { PostureReminderUI } from "@/components/posture-reminder/posture-reminder-ui";
import { PostureNotification } from "@/components/posture-reminder/posture-notification";
import { PainLogChart } from "@/components/posture-reminder/pain-log-chart";
import { PostureDetector } from "@/components/posture-reminder/posture-detector";
import { PostureTips } from "./posture-tips";
import { Calendar } from "@/components/ui/calendar";
import { usePostureAlarm } from "@/hooks/use-posture-alarm";
import { PainLocation } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Calendar as CalendarIcon,
  PieChart,
  Settings,
  AlertTriangle,
  ArrowUp,
  Activity,
  Clock,
  Plus,
} from "lucide-react";

export function PostureDashboard() {
  const { state, getPainLogs, startReminders, stopReminders } =
    usePostureAlarm();
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Calculate pain statistics
  const allLogs = getPainLogs(90); // Get logs from last 90 days
  const totalLogs = allLogs.length;
  const averagePain = totalLogs
    ? allLogs.reduce((sum, log) => sum + log.level, 0) / totalLogs
    : 0;

  // Count pain by location
  const painByLocation = allLogs.reduce(
    (acc, log) => {
      acc[log.location] = (acc[log.location] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Find most painful location
  let mostPainfulLocation = "None";
  let maxCount = 0;

  for (const [location, count] of Object.entries(painByLocation)) {
    if (count > maxCount) {
      maxCount = count;
      mostPainfulLocation = location
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posture Guardian</h1>
          <p className="text-muted-foreground">
            Track and improve your posture throughout the workday
          </p>
        </div>
        <Button
          variant={state.isActive ? "destructive" : "default"}
          onClick={state.isActive ? stopReminders : startReminders}
          className="gap-2"
        >
          <ArrowUp className="h-4 w-4" />
          {state.isActive ? "Pause Reminders" : "Start Reminders"}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Reminder Interval
                </p>
                <p className="text-2xl font-bold">30 min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{totalLogs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Pain Level</p>
                <p className="text-2xl font-bold">{averagePain.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <ArrowUp className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Problem Area</p>
                <p className="text-2xl font-bold">{mostPainfulLocation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PainLogChart />

          <PostureDetector />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pain Calendar</CardTitle>
              <CardDescription>View your pain history by date</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
                // Add a custom day renderer to show pain level indicators
                components={{
                  DayContent: ({ date, ...props }) => {
                    // Find all logs for this date
                    const dayStart = new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      0,
                      0,
                      0
                    ).getTime();
                    const dayEnd = new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      23,
                      59,
                      59
                    ).getTime();

                    const dayLogs = allLogs.filter(
                      (log) =>
                        log.timestamp >= dayStart && log.timestamp <= dayEnd
                    );

                    if (dayLogs.length === 0) {
                      return <div {...props}>{date.getDate()}</div>;
                    }

                    // Calculate average pain level for this day
                    const avgPain =
                      dayLogs.reduce((sum, log) => sum + log.level, 0) /
                      dayLogs.length;

                    // Choose color based on pain level
                    let bgColor = "bg-green-100";
                    if (avgPain >= 7) bgColor = "bg-red-100";
                    else if (avgPain >= 4) bgColor = "bg-amber-100";

                    return (
                      <div
                        {...props}
                        className={`flex items-center justify-center ${bgColor} rounded-full h-8 w-8`}
                      >
                        {date.getDate()}
                      </div>
                    );
                  },
                }}
              />

              <div className="mt-4 flex justify-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-green-100"></div>
                  <span className="text-xs">Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-amber-100"></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 rounded-full bg-red-100"></div>
                  <span className="text-xs">High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <PostureTips />
        </div>
      </div>

      {/* Fixed UI components */}
      <PostureReminderUI />
      <PostureNotification />
    </div>
  );
}
