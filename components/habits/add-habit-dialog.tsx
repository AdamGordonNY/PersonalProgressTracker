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
import { createHabit, HabitInput } from "@/actions/habit";
import { Priority } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHabitCreated?: () => Promise<void>;
}

export function AddHabitDialog({
  open,
  onOpenChange,
  onHabitCreated,
}: AddHabitDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<HabitInput>({
    name: "",
    description: "",
    priority: Priority.OPTIONAL,
    coins: 10,
    location: "",
    timeOfDay: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Habit name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createHabit(formData);

      if ("error" in result) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Habit created successfully",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        priority: Priority.OPTIONAL,
        coins: 10,
        location: "",
        timeOfDay: "",
      });

      // Close dialog
      onOpenChange(false);

      // Refresh habits list
      if (onHabitCreated) {
        await onHabitCreated();
      }
    } catch (error) {
      console.error("Error creating habit:", error);
      toast({
        title: "Error",
        description: "Failed to create habit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Morning Meditation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your habit..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: Priority) =>
                setFormData({ ...formData, priority: value })
              }
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Priority.CRITICAL}>Critical</SelectItem>
                <SelectItem value={Priority.IMPORTANT}>Important</SelectItem>
                <SelectItem value={Priority.OPTIONAL}>Optional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coins">Coins Reward</Label>
            <Input
              id="coins"
              type="number"
              value={formData.coins?.toString() || "10"}
              onChange={(e) =>
                setFormData({ ...formData, coins: parseInt(e.target.value) })
              }
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g., Home, Office"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeOfDay">Time of Day (Optional)</Label>
            <Input
              id="timeOfDay"
              type="time"
              value={formData.timeOfDay}
              onChange={(e) =>
                setFormData({ ...formData, timeOfDay: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Habit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
