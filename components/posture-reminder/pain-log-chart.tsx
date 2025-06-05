"use client";

import { useState, useMemo } from "react";
import { usePostureAlarm } from "@/hooks/use-posture-alarm";
import { PainLocation } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
} from "date-fns";

export function PainLogChart() {
  const { getPainLogs } = usePostureAlarm();
  const [timeRange, setTimeRange] = useState("7"); // days
  const [activeTab, setActiveTab] = useState("trend");

  // Get the pain logs for the selected time range
  const logs = useMemo(() => {
    return getPainLogs(parseInt(timeRange, 10));
  }, [getPainLogs, timeRange]);

  // Prepare data for trend chart (average pain level per day)
  const trendData = useMemo(() => {
    if (logs.length === 0) return [];

    // Create a range of dates
    const days = eachDayOfInterval({
      start: startOfDay(subDays(new Date(), parseInt(timeRange, 10) - 1)),
      end: endOfDay(new Date()),
    });

    // Map each day to its average pain level
    return days.map((day) => {
      const dayStart = startOfDay(day).getTime();
      const dayEnd = endOfDay(day).getTime();

      // Get logs for this day
      const dayLogs = logs.filter(
        (log) => log.timestamp >= dayStart && log.timestamp <= dayEnd
      );

      // Calculate average pain level
      const avgPain = dayLogs.length
        ? dayLogs.reduce((sum, log) => sum + log.level, 0) / dayLogs.length
        : 0;

      return {
        date: format(day, "MMM dd"),
        value: parseFloat(avgPain.toFixed(1)),
        count: dayLogs.length,
      };
    });
  }, [logs, timeRange]);

  // Prepare data for location chart
  const locationData = useMemo(() => {
    if (logs.length === 0) return [];

    const locationCounts: Record<string, number> = {};

    // Count occurrences of each pain location
    logs.forEach((log) => {
      locationCounts[log.location] = (locationCounts[log.location] || 0) + 1;
    });

    // Convert to array format for chart
    return Object.entries(locationCounts).map(([location, count]) => ({
      name: location
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      value: count,
    }));
  }, [logs]);

  // Colors for the pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  // Render different content based on log availability
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pain History</CardTitle>
        </CardHeader>
        <CardContent className="flex h-60 items-center justify-center text-center">
          <div>
            <p className="mb-2 text-muted-foreground">
              No pain logs recorded yet
            </p>
            <p className="text-sm text-muted-foreground">
              Use the &quot;Log Pain&quot; button to track your discomfort
              levels
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pain History</CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="trend" className="flex-1">
              Pain Trend
            </TabsTrigger>
            <TabsTrigger value="location" className="flex-1">
              Pain Locations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trend">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip
                    formatter={(value) => [`Pain Level: ${value}`, "Average"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="location">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {locationData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-2 text-xs text-muted-foreground">
          {logs.length} pain logs recorded in the selected time period
        </div>
      </CardContent>
    </Card>
  );
}
