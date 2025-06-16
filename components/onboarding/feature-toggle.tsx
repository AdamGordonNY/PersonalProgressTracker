"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Layers,
  Bold as Golf,
  Clock,
  ArrowUpCircle,
  RssIcon,
  Cloud,
  ClipboardList,
  Music2Icon,
} from "lucide-react";
import { getUserFeatures, updateUserFeatures } from "@/actions/user";

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export function FeatureToggle() {
  const { user } = useUser();
  const { toast } = useToast();
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const featuresList: Feature[] = [
    {
      id: "content_board",
      name: "Content Board",
      description: "Organize your content creation with a Kanban-style board",
      icon: <Layers className="h-6 w-6 text-sage-600" />,
    },
    {
      id: "golf_tracker",
      name: "Golf Tracker",
      description:
        "Track your golf rounds, shots, and analyze your performance",
      icon: <Golf className="h-6 w-6 text-emerald-600" />,
    },
    {
      id: "time_guardian",
      name: "Time Guardian",
      description: "Manage your focus periods and work sessions",
      icon: <Clock className="h-6 w-6 text-blue-600" />,
    },
    {
      id: "posture_reminder",
      name: "Posture Guardian",
      description: "Get reminders to maintain good posture while working",
      icon: <ArrowUpCircle className="h-6 w-6 text-amber-600" />,
    },
    {
      id: "rss_feeds",
      name: "RSS Feeds",
      description: "Monitor content sources and stay updated",
      icon: <RssIcon className="h-6 w-6 text-orange-600" />,
    },
    {
      id: "cloud_storage",
      name: "Cloud Storage",
      description: "Connect to Google Drive and OneDrive",
      icon: <Cloud className="h-6 w-6 text-sky-600" />,
    },
    {
      id: "questionnaires",
      name: "Questionnaires",
      description: "Create and manage surveys and questionnaires",
      icon: <ClipboardList className="h-6 w-6 text-purple-600" />,
    },
    {
      id: "music_mastery",
      name: "Music Mastery",
      description: "Track your musical journey with practice logs and goals",
      icon: <Music2Icon className="h-6 w-6 text-teal-600" />, // Placeholder icon, replace with a music-related icon if available
    },
  ];

  // Fetch user features
  useEffect(() => {
    const fetchFeatures = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const result = await getUserFeatures(user.id);

          if (result.error) {
            throw new Error(String(result?.error));
          }

          // Initialize with defaults if some features are missing
          const defaultFeatures = {
            content_board: true, // Core feature is always on
            golf_tracker: false,
            time_guardian: false,
            posture_reminder: false,
            rss_feeds: false,
            cloud_storage: false,
            questionnaires: false,
            music_mastery: false,
            habit_tracker: false, // Assuming habit tracker is a future feature
          };

          setFeatures({
            ...defaultFeatures,
            ...result.features,
          });
        } catch (error) {
          console.error("Error fetching user features:", error);
          toast({
            title: "Error",
            description: "Failed to load your feature preferences",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFeatures();
  }, [user?.id, toast]);

  const toggleFeature = (featureId: string) => {
    if (featureId === "content_board") return; // Don't allow toggling the core feature

    setFeatures((prev) => ({
      ...prev,
      [featureId]: !prev[featureId],
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const result = await updateUserFeatures(user.id, features);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Your feature preferences have been saved",
      });
    } catch (error) {
      console.error("Error saving feature preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save your feature preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Features</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {featuresList.map((feature) => (
            <div
              key={feature.id}
              className={`flex items-start justify-between rounded-lg border p-4 ${
                features[feature.id]
                  ? "border-sage-200 bg-sage-50 dark:border-sage-800 dark:bg-sage-950/20"
                  : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-full bg-gray-100 p-2 ${
                    features[feature.id] ? "text-sage-600" : "text-gray-500"
                  }`}
                >
                  {feature.icon}
                </div>
                <div>
                  <Label
                    htmlFor={`feature-${feature.id}`}
                    className="text-base font-medium"
                  >
                    {feature.name}
                    {feature.id === "content_board" && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Core Feature)
                      </span>
                    )}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
              <Switch
                id={`feature-${feature.id}`}
                checked={features[feature.id] || false}
                onCheckedChange={() => toggleFeature(feature.id)}
                disabled={feature.id === "content_board"} // Core feature cannot be disabled
              />
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-sage-600 hover:bg-sage-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
