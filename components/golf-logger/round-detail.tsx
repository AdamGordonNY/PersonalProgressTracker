"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CloudRain,
  Wind,
  Thermometer,
  Bold as Golf,
  Map,
  Plus,
} from "lucide-react";

import Link from "next/link";
import { HoleDetail } from "./hole-detail";
import { RoundMap } from "./round-map";
import { ShotTracker } from "./shot-tracker";

interface RoundDetailProps {
  round: any;
}

export function RoundDetail({ round }: RoundDetailProps) {
  const [activeTab, setActiveTab] = useState("scorecard");
  const [selectedHole, setSelectedHole] = useState(round.holes[0]?.id || "");
  const [showShotTracker, setShowShotTracker] = useState(false);

  const router = useRouter();

  // Format date
  const formattedDate = new Date(round.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Helper to get weather icon
  const getWeatherIcon = () => {
    if (!round.weather) return <CloudRain className="h-5 w-5" />;

    // This would be replaced with logic based on actual weather data
    return <CloudRain className="h-5 w-5" />;
  };

  // Group shots by hole
  const shotsByHole = round.shots.reduce((acc: any, shot: any) => {
    if (!acc[shot.holeId]) {
      acc[shot.holeId] = [];
    }
    acc[shot.holeId].push(shot);
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center">
        <Link href="/golf">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{round.courseName}</h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
      </div>

      {/* Round Overview */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card className="bg-emerald-50 dark:bg-emerald-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Score</p>
                <p className="text-2xl font-bold">{round.totalScore}</p>
              </div>
              <div className="rounded-full bg-emerald-200 p-2 dark:bg-emerald-800">
                <Golf className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 dark:bg-emerald-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Putts</p>
                <p className="text-2xl font-bold">{round.totalPutts}</p>
              </div>
              <div className="rounded-full bg-emerald-200 p-2 dark:bg-emerald-800">
                <Golf className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 dark:bg-emerald-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fairways Hit</p>
                <p className="text-2xl font-bold">
                  {round.fairwaysHit}/{round.holes.length}
                </p>
              </div>
              <div className="rounded-full bg-emerald-200 p-2 dark:bg-emerald-800">
                <Golf className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 dark:bg-emerald-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">GIR</p>
                <p className="text-2xl font-bold">
                  {round.greensInReg}/{round.holes.length}
                </p>
              </div>
              <div className="rounded-full bg-emerald-200 p-2 dark:bg-emerald-800">
                <Golf className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Round Details */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="scorecard" className="flex items-center gap-2">
            <Golf className="h-4 w-4" />
            Scorecard
          </TabsTrigger>
          <TabsTrigger value="shots" className="flex items-center gap-2">
            <Golf className="h-4 w-4" />
            Shot Tracking
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Shot Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scorecard">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Scorecard</CardTitle>
                {round.weather && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getWeatherIcon()}
                      <span>{round.weather.condition || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-4 w-4" />
                      <span>{round.weather.temperature || "--"}°</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wind className="h-4 w-4" />
                      <span>{round.weather.windSpeed || "--"} mph</span>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse">
                  <thead>
                    <tr className="border-b text-sm">
                      <th className="p-2 text-left">Hole</th>
                      <th className="p-2 text-left">Par</th>
                      <th className="p-2 text-left">Strokes</th>
                      <th className="p-2 text-left">+/-</th>
                      <th className="p-2 text-left">Putts</th>
                      <th className="p-2 text-left">Fairway</th>
                    </tr>
                  </thead>
                  <tbody>
                    {round.holes.map((hole: any) => (
                      <tr key={hole.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{hole.holeNumber}</td>
                        <td className="p-2">{hole.par}</td>
                        <td className="p-2">{hole.strokes || "-"}</td>
                        <td className="p-2">
                          {hole.strokes
                            ? `${hole.strokes - hole.par > 0 ? "+" : ""}${hole.strokes - hole.par}`
                            : "-"}
                        </td>
                        <td className="p-2">{hole.putts || "-"}</td>
                        <td className="p-2">{hole.fairwayHit ? "✓" : "✗"}</td>
                      </tr>
                    ))}
                    <tr className="border-b font-medium bg-muted/20">
                      <td className="p-2">Total</td>
                      <td className="p-2">
                        {round.holes.reduce(
                          (sum: number, h: any) => sum + h.par,
                          0
                        )}
                      </td>
                      <td className="p-2">{round.totalScore}</td>
                      <td className="p-2">
                        {`${round.totalScore - round.holes.reduce((sum: number, h: any) => sum + h.par, 0) > 0 ? "+" : ""}
                        ${round.totalScore - round.holes.reduce((sum: number, h: any) => sum + h.par, 0)}`}
                      </td>
                      <td className="p-2">{round.totalPutts}</td>
                      <td className="p-2">
                        {round.fairwaysHit}/{round.holes.length}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shots">
          <div className="grid gap-4 md:grid-cols-12">
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Holes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {round.holes.map((hole: any) => (
                    <Button
                      key={hole.id}
                      variant={selectedHole === hole.id ? "default" : "outline"}
                      onClick={() => setSelectedHole(hole.id)}
                      className="h-10 w-10 p-0"
                    >
                      {hole.holeNumber}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-9">
              <HoleDetail
                hole={round.holes.find((h: any) => h.id === selectedHole)}
                shots={shotsByHole[selectedHole] || []}
              />

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => setShowShotTracker(true)}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Shot
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="map">
          <RoundMap round={round} />
        </TabsContent>
      </Tabs>

      {showShotTracker && (
        <ShotTracker
          roundId={round.id}
          holeId={selectedHole}
          onClose={() => setShowShotTracker(false)}
          onShotAdded={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
