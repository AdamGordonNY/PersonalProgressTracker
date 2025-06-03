"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCourse } from "@/actions/golf";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, MapPin } from "lucide-react";

interface AddCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCourseCreated?: () => void;
}

export function AddCourseDialog({
  open,
  onOpenChange,
  onCourseCreated,
}: AddCourseDialogProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [holes, setHoles] = useState([
    // Default 9 holes setup
    ...Array(9)
      .fill(null)
      .map((_, i) => ({
        holeNumber: i + 1,
        par: 4,
        yards: 350,
        handicap: i + 1,
      })),
  ]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddHole = () => {
    const nextHoleNumber = holes.length + 1;
    setHoles([
      ...holes,
      {
        holeNumber: nextHoleNumber,
        par: 4,
        yards: 350,
        handicap: nextHoleNumber,
      },
    ]);
  };

  const handleRemoveHole = (index: number) => {
    const newHoles = [...holes];
    newHoles.splice(index, 1);

    // Renumber holes
    newHoles.forEach((hole, idx) => {
      hole.holeNumber = idx + 1;
    });

    setHoles(newHoles);
  };

  const handleHoleChange = (index: number, field: string, value: any) => {
    const newHoles = [...holes];
    newHoles[index] = {
      ...newHoles[index],
      [field]: typeof value === "string" ? parseInt(value) || 0 : value,
    };
    setHoles(newHoles);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsGettingLocation(false);

        toast({
          title: "Success",
          description: "Location captured successfully",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Error",
          description: `Failed to get location: ${error.message}`,
          variant: "destructive",
        });
      }
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !location.trim()) {
      toast({
        title: "Error",
        description: "Course name and location are required",
        variant: "destructive",
      });
      return;
    }

    if (latitude === 0 && longitude === 0) {
      toast({
        title: "Error",
        description: "Please capture the course location",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createCourse({
        name,
        location,
        latitude,
        longitude,
        holes,
      });

      if ("error" in result) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Course created successfully",
      });

      onOpenChange(false);

      if (onCourseCreated) {
        onCourseCreated();
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setLocation("");
    setLatitude(0);
    setLongitude(0);
    setHoles(
      Array(9)
        .fill(null)
        .map((_, i) => ({
          holeNumber: i + 1,
          par: 4,
          yards: 350,
          handicap: i + 1,
        }))
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-6">
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter course name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                />
              </div>
            </div>

            <div>
              <Label>Course Coordinates</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="grid flex-1 grid-cols-2 gap-2">
                  <Input
                    value={latitude || ""}
                    onChange={(e) =>
                      setLatitude(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Latitude"
                    type="number"
                    step="0.000001"
                  />
                  <Input
                    value={longitude || ""}
                    onChange={(e) =>
                      setLongitude(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Longitude"
                    type="number"
                    step="0.000001"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={getLocation}
                  disabled={isGettingLocation}
                  className="gap-2"
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4" />
                      Get Location
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Hole Details</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddHole}
                  className="gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Hole
                </Button>
              </div>
              <div className="space-y-3">
                {holes.map((hole, index) => (
                  <div key={index} className="rounded-md border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">Hole {hole.holeNumber}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleRemoveHole(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`par-${index}`} className="text-xs">
                          Par
                        </Label>
                        <Input
                          id={`par-${index}`}
                          type="number"
                          min="3"
                          max="5"
                          value={hole.par}
                          onChange={(e) =>
                            handleHoleChange(index, "par", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`yards-${index}`} className="text-xs">
                          Yards
                        </Label>
                        <Input
                          id={`yards-${index}`}
                          type="number"
                          min="100"
                          value={hole.yards}
                          onChange={(e) =>
                            handleHoleChange(index, "yards", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor={`handicap-${index}`}
                          className="text-xs"
                        >
                          Handicap
                        </Label>
                        <Input
                          id={`handicap-${index}`}
                          type="number"
                          min="1"
                          max="18"
                          value={hole.handicap}
                          onChange={(e) =>
                            handleHoleChange(index, "handicap", e.target.value)
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !name.trim() ||
                !location.trim() ||
                (latitude === 0 && longitude === 0)
              }
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Course"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
