"use client";

import { useState, useEffect, SetStateAction } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  GolfRound,
  GolfHole,
  GolfShot,
  ClubType,
  ShotType,
} from "@prisma/client";
import { Button } from "../ui/button";
interface ShotAnalysisProps {
  round: GolfRound & {
    holes: (GolfHole & {
      shots: GolfShot[];
    })[];
  };
  courseData: any; // From KML import
}

export function ShotAnalysis({ round, courseData }: ShotAnalysisProps) {
  const [activeHole, setActiveHole] = useState<number>(1);
  const [clubStats, setClubStats] = useState<any[]>([]);
  const [accuracyData, setAccuracyData] = useState<any[]>([]);

  useEffect(() => {
    if (!round || !round.holes) return;

    // Calculate club statistics
    const clubMap = new Map<
      ClubType,
      { count: number; totalDistance: number }
    >();

    // Calculate accuracy data
    const accuracy: SetStateAction<any[]> = [];

    round.holes.forEach((hole) => {
      hole.shots.forEach((shot, index) => {
        // Club stats
        if (!clubMap.has(shot.club)) {
          clubMap.set(shot.club, { count: 0, totalDistance: 0 });
        }
        const clubData = clubMap.get(shot.club)!;
        clubMap.set(shot.club, {
          count: clubData.count + 1,
          totalDistance: clubData.totalDistance + shot.distance,
        });

        // Accuracy stats (only for approach shots)
        if (shot.shotType === "APPROACH") {
          accuracy.push({
            hole: hole.holeNumber,
            distanceToPin: (shot as any).distanceToPin ?? 0,
            club: shot.club,
            result: shot.result,
          });
        }
      });
    });

    // Format club stats for chart
    const clubStatsData = Array.from(clubMap).map(([club, data]) => ({
      club,
      count: data.count,
      avgDistance: Math.round(data.totalDistance / data.count),
    }));

    setClubStats(clubStatsData);
    setAccuracyData(accuracy);
  }, [round]);

  // Get current hole data
  const currentHole = round.holes.find((h) => h.holeNumber === activeHole);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">
            <Icons.overview className="h-4 w-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="clubs">
            <Icons.clubs className="h-4 w-4 mr-2" /> Club Analysis
          </TabsTrigger>
          <TabsTrigger value="accuracy">
            <Icons.target className="h-4 w-4 mr-2" /> Accuracy
          </TabsTrigger>
          <TabsTrigger value="hole">
            <Icons.flag className="h-4 w-4 mr-2" /> Hole Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Score"
              value={round.totalScore}
              icon={<Icons.score className="h-6 w-6" />}
              description={`${round.totalScore - round.holes.reduce((sum, h) => sum + h.par, 0)} to par`}
            />
            <StatCard
              title="Fairways Hit"
              value={`${round.fairwaysHit}/${round.holes.filter((h) => h.par >= 4).length}`}
              icon={<Icons.fairway className="h-6 w-6" />}
              description={`${Math.round((round.fairwaysHit / round.holes.filter((h) => h.par >= 4).length) * 100)}%`}
            />
            <StatCard
              title="Greens in Reg"
              value={`${round.greensInReg}/18`}
              icon={<Icons.green className="h-6 w-6" />}
              description={`${Math.round((round.greensInReg / 18) * 100)}%`}
            />
            <StatCard
              title="Putts"
              value={round.totalPutts}
              icon={<Icons.putt className="h-6 w-6" />}
              description={`${Math.round(round.totalPutts / 18)} per hole`}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ScoreDistributionChart holes={round.holes} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shot Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ShotTypeChart holes={round.holes} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clubs">
          <Card>
            <CardHeader>
              <CardTitle>Club Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ClubPerformanceChart data={clubStats} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accuracy">
          <Card>
            <CardHeader>
              <CardTitle>Approach Shot Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <AccuracyChart data={accuracyData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hole">
          <div className="flex items-center space-x-4 mb-6">
            <h3 className="text-lg font-semibold">Hole: {activeHole}</h3>
            <div className="flex space-x-2">
              {Array.from({ length: 18 }, (_, i) => i + 1).map((num) => (
                <Button
                  key={num}
                  variant={activeHole === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveHole(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          {currentHole && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hole Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <strong>Par:</strong> {currentHole.par}
                    </p>
                    <p>
                      <strong>Score:</strong> {currentHole.strokes} (
                      {currentHole.strokes - currentHole.par >= 0
                        ? `+${currentHole.strokes - currentHole.par}`
                        : currentHole.strokes - currentHole.par}
                      )
                    </p>
                    <p>
                      <strong>Putts:</strong> {currentHole.putts}
                    </p>
                    <p>
                      <strong>Fairway:</strong>{" "}
                      {currentHole.fairwayHit ? "Hit" : "Missed"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Shots</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShotList shots={currentHole.shots} />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper components
function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ShotList({ shots }: { shots: GolfShot[] }) {
  return (
    <div className="space-y-3">
      {shots.map((shot, index) => (
        <div key={index} className="border rounded p-3">
          <div className="flex justify-between">
            <div>
              <span className="font-medium">{shot.club}</span> - {shot.shotType}
            </div>
            <div className="font-bold">{shot.distance} yards</div>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {shot.result} | Elevation: {shot.elevation} ft | Wind:{" "}
            {shot.windSpeed} mph
          </div>
          {shot.note && (
            <div className="mt-2 text-sm">
              <strong>Note:</strong> {shot.note}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ClubPerformanceChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="club" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="avgDistance" name="Avg Distance (yds)" fill="#3b82f6" />
        <Bar dataKey="count" name="Shots Taken" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function AccuracyChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart>
        <XAxis
          type="number"
          dataKey="distanceToPin"
          name="Distance to Pin"
          unit="yds"
        />
        <YAxis dataKey="club" name="Club" />
        <ZAxis range={[50, 300]} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Legend />
        <Scatter name="Approach Shots" data={data} fill="#f59e0b" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function ScoreDistributionChart({ holes }: { holes: GolfHole[] }) {
  const scores: Record<number, number> = {};

  holes.forEach((hole) => {
    const diff = hole.strokes - hole.par;
    scores[diff] = (scores[diff] || 0) + 1;
  });

  const data = Object.entries(scores).map(([diff, count]) => ({
    name:
      diff === "0"
        ? "Par"
        : diff === "1"
          ? "Bogey"
          : diff === "-1"
            ? "Birdie"
            : diff === "2"
              ? "Double"
              : diff === "-2"
                ? "Eagle"
                : parseInt(diff) > 2
                  ? `+${diff}`
                  : diff,
    value: count,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" name="Holes" fill="#8b5cf6" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ShotTypeChart({
  holes,
}: {
  holes: (GolfHole & { shots: GolfShot[] })[];
}) {
  const shotTypes: Record<ShotType, number> = {
    DRIVE: 0,
    FAIRWAY: 0,
    APPROACH: 0,
    CHIP: 0,
    PITCH: 0,
    BUNKER: 0,
    PUTT: 0,
    RECOVERY: 0,
  };

  holes.forEach((hole) => {
    hole.shots.forEach((stroke: GolfShot) => {
      shotTypes[stroke.shotType] = (shotTypes[stroke.shotType] || 0) + 1;
    });
  });

  const data = Object.entries(shotTypes)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: type.charAt(0) + type.slice(1).toLowerCase(),
      value: count,
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" name="Shots" fill="#ec4899" />
      </BarChart>
    </ResponsiveContainer>
  );
}
