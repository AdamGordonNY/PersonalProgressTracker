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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AddFeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFeedAdded: () => void;
}

export function AddFeedDialog({
  open,
  onOpenChange,
  onFeedAdded,
}: AddFeedDialogProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to add feed");
      }

      toast({
        title: "Success",
        description: "Feed added successfully",
      });

      onFeedAdded();
      onOpenChange(false);
      setUrl("");
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to add feed. Make sure it's a valid Substack RSS URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Substack Feed</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="url">Feed URL</Label>
            <Input
              id="url"
              placeholder="https://example.substack.com/feed"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              pattern="^https:\/\/.*\.substack\.com\/feed\/?$"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Enter the RSS feed URL from your favorite Substack newsletter
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !url.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Feed"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
