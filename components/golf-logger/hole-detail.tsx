"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bold as Golf } from "lucide-react";

interface HoleDetailProps {
  hole: any;
  shots: any[];
}

export function HoleDetail({ hole, shots }: HoleDetailProps) {
  if (!hole) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Select a hole to view details
        </CardContent>
      </Card>
    );
  }

  // Format shot type for display
  const formatShotType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Format club for display
  const formatClub = (club: string) => {
    return club
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
      .replace("Lob Wedge", "LW");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Hole {hole.holeNumber}</CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline">Par {hole.par}</Badge>
            <Badge
              variant={
                hole.strokes < hole.par
                  ? "default"
                  : hole.strokes > hole.par
                    ? "destructive"
                    : "outline"
              }
            >
              {hole.strokes || "-"}
              {hole.strokes &&
                ` (${
                  hole.strokes === hole.par
                    ? "Par"
                    : hole.strokes === hole.par - 1
                      ? "Birdie"
                      : hole.strokes === hole.par - 2
                        ? "Eagle"
                        : hole.strokes === hole.par + 1
                          ? "Bogey"
                          : hole.strokes === hole.par + 2
                            ? "Double Bogey"
                            : hole.strokes > hole.par
                              ? `+${hole.strokes - hole.par}`
                              : `-${hole.par - hole.strokes}`
                })`}
            </Badge>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="rounded-md bg-muted p-2 text-center">
            <p className="text-xs text-muted-foreground">Putts</p>
            <p className="font-medium">{hole.putts || "-"}</p>
          </div>
          <div className="rounded-md bg-muted p-2 text-center">
            <p className="text-xs text-muted-foreground">Fairway Hit</p>
            <p className="font-medium">{hole.fairwayHit ? "Yes" : "No"}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <h3 className="mb-2 font-medium">Shot Tracking</h3>

          {shots.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-center text-muted-foreground">
              <Golf className="mx-auto mb-2 h-5 w-5" />
              <p>No shots recorded for this hole</p>
              <p className="text-xs">
                Add shots to track your performance in detail
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {shots.map((shot, index) => (
                <div key={shot.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-1">
                        Shot {index + 1}
                      </Badge>
                      <h4 className="font-medium">
                        {formatShotType(shot.shotType)} •{" "}
                        {formatClub(shot.club)}
                      </h4>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{shot.distance} yards</span>
                        {shot.result && (
                          <>
                            <span>•</span>
                            <span>Result: {shot.result}</span>
                          </>
                        )}
                        {shot.elevation !== null && (
                          <>
                            <span>•</span>
                            <span>Elevation: {shot.elevation} ft</span>
                          </>
                        )}
                      </div>

                      {(shot.windSpeed || shot.windDirection) && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {shot.windSpeed && `Wind: ${shot.windSpeed} mph`}
                          {shot.windDirection && ` ${shot.windDirection}`}
                        </div>
                      )}

                      {shot.note && (
                        <>
                          <Separator className="my-2" />
                          <p className="text-sm italic">{shot.note}</p>
                        </>
                      )}
                    </div>

                    {shot.latitude && shot.longitude && (
                      <Badge variant="secondary" className="text-xs">
                        GPS Tracked
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
