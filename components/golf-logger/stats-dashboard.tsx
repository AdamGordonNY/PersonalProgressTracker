"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";

interface StatsDashboardProps {
  stats: any;
  rounds: any[];
  isLoading: boolean;
}

// Custom colors for charts
const COLORS = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"];

export function StatsDashboard({
  stats,
  rounds,
  isLoading,
}: StatsDashboardProps) {
  if (isLoading) {
    return (
      <Card className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (!stats || rounds.length === 0) {
    return (
      <Card className="min-h-[400px]">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <h3 className="mb-2 text-xl font-semibold">No Stats Available</h3>
          <p className="text-muted-foreground">
            Complete at least one round to see your statistics
          </p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for score trend chart
  const scoreTrendData = rounds
    .map((round: any) => ({
      date: format(new Date(round.date), "MMM d"),
      score: round.totalScore,
    }))
    .reverse(); // Show oldest to newest

  // Prepare data for shot type distribution
  const shotTypeData = stats.shotsByType
    ? Object.entries(stats.shotsByType).map(([type, count]) => ({
        name: type
          .split("_")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" "),
        value: count,
      }))
    : [];

  // Prepare data for club usage
  const clubUsageData = stats.clubUsage
    ? Object.entries(stats.clubUsage)
        .map(([club, count]) => ({
          name: club
            .split("_")
            .map((word) => {
              if (
                [
                  "TWO",
                  "THREE",
                  "FOUR",
                  "FIVE",
                  "SIX",
                  "SEVEN",
                  "EIGHT",
                  "NINE",
                ].includes(word)
              ) {
                return word.charAt(0);
              }
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(" ")
            .replace("Pitching Wedge", "PW")
            .replace("Gap Wedge", "GW")
            .replace("Sand Wedge", "SW")
            .replace("Lob Wedge", "LW"),
          count: count,
        }))
        .sort((a, b) => (b.count as number) - (a.count as number))
    : [];

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="shots">Shot Analysis</TabsTrigger>
        <TabsTrigger value="clubs">Club Performance</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Scoring Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-md bg-muted p-3 text-center">
                    <p className="text-sm text-muted-foreground">Best Round</p>
                    <p className="text-2xl font-bold">{stats.bestScore}</p>
                  </div>
                  <div className="rounded-md bg-muted p-3 text-center">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">{stats.averageScore}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-md bg-muted p-3 text-center">
                    <p className="text-sm text-muted-foreground">Fairway %</p>
                    <p className="text-2xl font-bold">
                      {stats.fairwayPercentage}%
                    </p>
                  </div>
                  <div className="rounded-md bg-muted p-3 text-center">
                    <p className="text-sm text-muted-foreground">Putts/Round</p>
                    <p className="text-2xl font-bold">{stats.averagePutts}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="shots" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Shot Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {shotTypeData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%\" height="100%">
                    <PieChart>
                      <Pie
                        data={shotTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {shotTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No shot tracking data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shot Result Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Track more shots to see result analysis
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="clubs" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Club Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {clubUsageData.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%\" height="100%">
                  <BarChart
                    layout="vertical"
                    data={clubUsageData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 60,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      scale="band"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No club usage data available
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
