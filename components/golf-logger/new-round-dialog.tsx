"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRound } from "@/actions/golf";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface NewRoundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: any[];
  onRoundCreated?: (roundId: string) => void;
}

export function NewRoundDialog({
  open,
  onOpenChange,
  courses = [],
  onRoundCreated,
}: NewRoundDialogProps) {
  const [courseName, setCourseName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [courseId, setCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Create default holes data
  const defaultHoles = Array.from({ length: 9 }, (_, i) => ({
    holeNumber: i + 1,
    par: 4,
    strokes: 0,
    putts: 0,
    fairwayHit: false,
  }));

  const handleSubmit = async () => {
    if (!courseName.trim()) {
      toast({
        title: "Error",
        description: "Course name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate empty round data
      const totalScore = defaultHoles.reduce((sum, h) => sum + h.strokes, 0);
      const totalPutts = defaultHoles.reduce((sum, h) => sum + h.putts, 0);
      const fairwaysHit = defaultHoles.filter((h) => h.fairwayHit).length;
      const greensInReg = 0; // Will be filled in during play

      const result = await createRound({
        courseName,
        date,
        totalScore,
        totalPutts,
        fairwaysHit,
        greensInReg,
        courseId: courseId || undefined,
        holes: defaultHoles,
      });

      if ("error" in result) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Round created successfully",
      });

      onOpenChange(false);

      if (onRoundCreated && result.round.id) {
        onRoundCreated(result.round.id);
      }
    } catch (error) {
      console.error("Error creating round:", error);
      toast({
        title: "Error",
        description: "Failed to create round",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCourseName("");
    setDate(new Date().toISOString().split("T")[0]);
    setCourseId("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Round</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {courses.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="courseSelect">
                Select Existing Course (Optional)
              </Label>
              <select
                id="courseSelect"
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  if (e.target.value) {
                    const selectedCourse = courses.find(
                      (c) => c.id === e.target.value
                    );
                    if (selectedCourse) {
                      setCourseName(selectedCourse.name);
                    }
                  }
                }}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">-- Select a course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="courseName">Course Name</Label>
            <Input
              id="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Enter course name"
            />
          </div>

          <div className="grid gap-2">
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !courseName.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Round"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
