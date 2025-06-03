"use client";

import { useState } from "react";
import { Plus, Save, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createRound } from "@/actions/golf";
import { useRouter } from "next/navigation";

interface HoleData {
  holeNumber: number;
  par: number;
  strokes: number;
  putts: number;
  fairwayHit: boolean;
}

export function Scorecard() {
  const [courseName, setCourseName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [holes, setHoles] = useState<HoleData[]>(
    Array(9)
      .fill(null)
      .map((_, i) => ({
        holeNumber: i + 1,
        par: 4,
        strokes: 0,
        putts: 0,
        fairwayHit: false,
      }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const updateHole = (
    index: number,
    field: keyof HoleData,
    value: number | boolean
  ) => {
    const newHoles = [...holes];
    newHoles[index] = { ...newHoles[index], [field]: value };
    setHoles(newHoles);
  };

  const getTotalScore = () =>
    holes.reduce((sum, hole) => sum + hole.strokes, 0);
  const getTotalPar = () => holes.reduce((sum, hole) => sum + hole.par, 0);
  const getTotalPutts = () => holes.reduce((sum, hole) => sum + hole.putts, 0);
  const getFairwaysHit = () => holes.filter((hole) => hole.fairwayHit).length;
  const getGreensInRegulation = () => {
    return holes.filter((hole) => {
      const regulation = hole.par - 2;
      return hole.strokes - hole.putts <= regulation;
    }).length;
  };

  const handleSave = async () => {
    if (!courseName.trim()) {
      toast({
        title: "Error",
        description: "Course name is required",
        variant: "destructive",
      });
      return;
    }

    // Validate scores
    const invalidHoles = holes.filter((h) => h.strokes <= 0 && h.putts > 0);
    if (invalidHoles.length > 0) {
      toast({
        title: "Error",
        description: "Holes with putts must have strokes entered",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createRound({
        courseName,
        date,
        totalScore: getTotalScore(),
        totalPutts: getTotalPutts(),
        fairwaysHit: getFairwaysHit(),
        greensInReg: getGreensInRegulation(),
        holes,
      });

      if ("error" in result) {
        throw new Error(result.error);
      }

      toast({
        title: "Round Saved",
        description: `${courseName} - ${new Date(date).toLocaleDateString()}`,
      });

      // Navigate to the round detail
      if (result.round?.id) {
        router.push(`/golf/rounds/${result.round.id}`);
      }
    } catch (error) {
      console.error("Error saving round:", error);
      toast({
        title: "Error",
        description: "Failed to save round",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Enter Round Details</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="courseName">Course Name</Label>
            <Input
              id="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Enter course name"
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className="mb-6 overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className="border-b text-sm">
                <th className="p-2 text-left">Hole</th>
                <th className="p-2 text-left">Par</th>
                <th className="p-2 text-left">Strokes</th>
                <th className="p-2 text-left">Putts</th>
                <th className="p-2 text-left">Fairway Hit</th>
              </tr>
            </thead>
            <tbody>
              {holes.map((hole, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min="3"
                      max="5"
                      value={hole.par}
                      onChange={(e) =>
                        updateHole(index, "par", parseInt(e.target.value) || 4)
                      }
                      className="w-20"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min="0"
                      value={hole.strokes}
                      onChange={(e) =>
                        updateHole(
                          index,
                          "strokes",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min="0"
                      max={hole.strokes || undefined}
                      value={hole.putts}
                      onChange={(e) =>
                        updateHole(
                          index,
                          "putts",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={hole.fairwayHit}
                      onChange={(e) =>
                        updateHole(index, "fairwayHit", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Separator className="my-6" />

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950">
            <div className="text-sm text-muted-foreground">Total Score</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {getTotalScore() > 0 ? getTotalScore() : "-"}
            </div>
          </div>
          <div className="rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950">
            <div className="text-sm text-muted-foreground">vs Par</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {getTotalScore() > 0
                ? getTotalScore() - getTotalPar() > 0
                  ? `+${getTotalScore() - getTotalPar()}`
                  : getTotalScore() - getTotalPar()
                : "-"}
            </div>
          </div>
          <div className="rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950">
            <div className="text-sm text-muted-foreground">Total Putts</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {getTotalPutts() > 0 ? getTotalPutts() : "-"}
            </div>
          </div>
          <div className="rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950">
            <div className="text-sm text-muted-foreground">Fairways Hit</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {getFairwaysHit()}/{holes.length}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setHoles(
                holes.map((hole) => ({
                  ...hole,
                  strokes: 0,
                  putts: 0,
                  fairwayHit: false,
                }))
              )
            }
          >
            Clear
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSubmitting || !courseName.trim() || getTotalScore() === 0
            }
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Round
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
