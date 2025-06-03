"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bold as Golf, Map, BarChart3, Plus } from "lucide-react";
import { Scorecard } from "@/components/golf-logger/scorecard";
import { StatsDashboard } from "@/components/golf-logger/stats-dashboard";
import { CourseMap } from "@/components/golf-logger/course-map";

import { getGolfStats, getRounds, getCourses } from "@/actions/golf";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NewRoundDialog } from "./new-round-dialog";
import { GolfRound, GolfCourse } from "@prisma/client";
export default function GolfDashboard() {
  const [activeTab, setActiveTab] = useState("scorecard");
  const [showNewRoundDialog, setShowNewRoundDialog] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [rounds, setRounds] = useState<GolfRound[]>([]);
  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsResult, roundsResult, coursesResult] = await Promise.all([
          getGolfStats(),
          getRounds(),
          getCourses(),
        ]);

        if ("stats" in statsResult) {
          setStats(statsResult.stats);
        }

        if ("rounds" in roundsResult) {
          setRounds(roundsResult?.rounds!);
        }

        if ("courses" in coursesResult) {
          setCourses(coursesResult?.courses!);
        }
      } catch (error) {
        console.error("Error loading golf data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRoundCreated = (roundId: string) => {
    router.push(`/golf/rounds/${roundId}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
            Golf Tracker
          </h1>
          <p className="text-muted-foreground">
            Track your rounds, analyze your performance
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowNewRoundDialog(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            New Round
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Rounds Played</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : stats?.roundsPlayed || 0}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-2">
                <Golf className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Average Score</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : stats?.averageScore || "N/A"}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-2">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Fairways Hit</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : `${stats?.fairwayPercentage || 0}%`}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-2">
                <Golf className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Avg. Putts</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "..." : stats?.averagePutts || "N/A"}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-2">
                <Golf className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="scorecard" className="flex items-center gap-2">
            <Golf className="h-4 w-4" />
            Rounds
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scorecard" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Rounds</h2>

            {rounds.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center">
                <Golf className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium">No rounds recorded yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start by creating your first round
                </p>
                <Button
                  className="mt-4 gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setShowNewRoundDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Round
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rounds.map((round: any) => (
                  <Link href={`/golf/rounds/${round.id}`} key={round.id}>
                    <Card className="cursor-pointer transition-shadow hover:shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle>{round.courseName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(round.date).toLocaleDateString()}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-md bg-muted p-2 text-center">
                            <p className="text-xs text-muted-foreground">
                              Score
                            </p>
                            <p className="font-medium">{round.totalScore}</p>
                          </div>
                          <div className="rounded-md bg-muted p-2 text-center">
                            <p className="text-xs text-muted-foreground">
                              Putts
                            </p>
                            <p className="font-medium">{round.totalPutts}</p>
                          </div>
                          <div className="rounded-md bg-muted p-2 text-center">
                            <p className="text-xs text-muted-foreground">FIR</p>
                            <p className="font-medium">
                              {Math.round((round.fairwaysHit / 9) * 100)}%
                            </p>
                          </div>
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground">
                          Click to view detailed stats and shots
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <StatsDashboard />
        </TabsContent>

        <TabsContent value="map">
          <CourseMap />
        </TabsContent>
      </Tabs>

      <NewRoundDialog
        open={showNewRoundDialog}
        onOpenChange={setShowNewRoundDialog}
        courses={courses}
        onRoundCreated={handleRoundCreated}
      />
    </div>
  );
}
