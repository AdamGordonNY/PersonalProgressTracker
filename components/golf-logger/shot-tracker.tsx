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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addShot } from "@/actions/golf";
import { ClubType, ShotType } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Save } from "lucide-react";
import { clubTypeToString, stringToClubType } from "@/lib/utils";
import { shotTypeToString, stringToShotType } from "@/lib/utils";

interface ShotTrackerProps {
  roundId: string;
  holeId: string;
  onClose: () => void;
  onShotAdded?: () => void;
}

export function ShotTracker({
  roundId,
  holeId,
  onClose,
  onShotAdded,
}: ShotTrackerProps) {
  const [shot, setShot] = useState<{
    club: ClubType;
    shotType: ShotType;
    distance: number;
    result: string;
    elevation: number;
    windSpeed: number;
    windDirection: string;
    note: string;
    latitude: number;
    longitude: number;
  }>({
    club: ClubType.DRIVER,
    shotType: ShotType.DRIVE,
    distance: 0,
    result: "",
    elevation: 0,
    windSpeed: 0,
    windDirection: "",
    note: "",
    latitude: 0,
    longitude: 0,
  });

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        setShot({
          ...shot,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

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
    if (shot.distance <= 0) {
      toast({
        title: "Validation Error",
        description: "Distance must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addShot({
        roundId,
        holeId,
        club: shot.club,
        shotType: shot.shotType,
        distance: shot.distance,
        result: shot.result || undefined,
        elevation: shot.elevation || undefined,
        windSpeed: shot.windSpeed || undefined,
        windDirection: shot.windDirection || undefined,
        latitude: shot.latitude || undefined,
        longitude: shot.longitude || undefined,
        note: shot.note || undefined,
      });

      if ("error" in result) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Shot added successfully",
      });

      if (onShotAdded) {
        onShotAdded();
      }

      onClose();
    } catch (error) {
      console.error("Error adding shot:", error);
      toast({
        title: "Error",
        description: "Failed to add shot",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Track Shot</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="club">Club</Label>
              <Select
                value={clubTypeToString(shot.club)}
                onValueChange={(value: any) => {
                  const clubType = stringToClubType(value);
                  if (clubType) {
                    setShot({ ...shot, club: clubType });
                  }
                }}
              >
                <SelectTrigger id="club">
                  <SelectValue placeholder="Select club" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ClubType).map((club) => (
                    <SelectItem key={club} value={clubTypeToString(club)}>
                      {clubTypeToString(club)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="shotType">Shot Type</Label>
              <Select
                value={shotTypeToString(shot.shotType)}
                onValueChange={(value) => {
                  const shotType = stringToShotType(value);
                  if (shotType) {
                    setShot({ ...shot, shotType });
                  }
                }}
              >
                <SelectTrigger id="shotType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ShotType).map((shotType) => (
                    <SelectItem
                      key={shotType}
                      value={shotTypeToString(shotType)}
                    >
                      {shotTypeToString(shotType)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="distance">Distance (yards)</Label>
              <Input
                id="distance"
                type="number"
                value={shot.distance}
                onChange={(e) =>
                  setShot({ ...shot, distance: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="result">Result</Label>
              <Select
                value={shot.result}
                onValueChange={(value) => setShot({ ...shot, result: value })}
              >
                <SelectTrigger id="result">
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fairway">Fairway</SelectItem>
                  <SelectItem value="Rough">Rough</SelectItem>
                  <SelectItem value="Sand">Sand</SelectItem>
                  <SelectItem value="Green">Green</SelectItem>
                  <SelectItem value="Water">Water</SelectItem>
                  <SelectItem value="OB">Out of Bounds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="elevation">Elevation (ft)</Label>
              <Input
                id="elevation"
                type="number"
                value={shot.elevation}
                onChange={(e) =>
                  setShot({ ...shot, elevation: parseInt(e.target.value) || 0 })
                }
              />
            </div>

            <div>
              <Label htmlFor="windSpeed">Wind (mph)</Label>
              <Input
                id="windSpeed"
                type="number"
                value={shot.windSpeed}
                onChange={(e) =>
                  setShot({ ...shot, windSpeed: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="windDirection">Wind Direction</Label>
              <Select
                value={shot.windDirection}
                onValueChange={(value) =>
                  setShot({ ...shot, windDirection: value })
                }
              >
                <SelectTrigger id="windDirection">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N">N</SelectItem>
                  <SelectItem value="NE">NE</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                  <SelectItem value="SE">SE</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="SW">SW</SelectItem>
                  <SelectItem value="W">W</SelectItem>
                  <SelectItem value="NW">NW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="note">Notes</Label>
            <Textarea
              id="note"
              value={shot.note}
              onChange={(e) => setShot({ ...shot, note: e.target.value })}
              placeholder="Add any notes about this shot..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label>Shot Location</Label>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="rounded-md border bg-muted/30 p-2 text-sm">
                {location ? (
                  <span>
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </span>
                ) : (
                  <span>No location captured</span>
                )}
              </div>
              <Button
                variant="secondary"
                onClick={getLocation}
                disabled={isGettingLocation}
                className="gap-2"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Capture Location
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || shot.distance <= 0}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Shot
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
