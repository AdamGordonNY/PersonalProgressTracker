"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Layers,
  Bold as Golf,
  Clock,
  ArrowUpCircle,
  RssIcon,
  Cloud,
  ClipboardList,
  CheckCircle2,
  Music2Icon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateUserFeatures } from "@/actions/user";

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

interface FeatureSelectionProps {
  userId: string;
}

export function FeatureSelection({ userId }: FeatureSelectionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [features, setFeatures] = useState<Feature[]>([
    {
      id: "content_board",
      name: "Content Board",
      description:
        "Organize your knowledge base and goals with a Kanban-style board",
      icon: <Layers className="h-6 w-6 text-sage-600" />,
      enabled: true, // Core feature, always enabled
    },
    {
      id: "golf_tracker",
      name: "Golf Tracker",
      description:
        "Track your golf rounds, shots, and analyze your performance",
      icon: <Golf className="h-6 w-6 text-emerald-600" />,
      enabled: false,
    },
    {
      id: "time_guardian",
      name: "Time Guardian",
      description: "Manage your focus periods and work sessions",
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      enabled: false,
    },
    {
      id: "posture_reminder",
      name: "Posture Guardian",
      description: "Get reminders to maintain good posture while working",
      icon: <ArrowUpCircle className="h-6 w-6 text-amber-600" />,
      enabled: false,
    },
    {
      id: "rss_feeds",
      name: "RSS Feeds",
      description: "Monitor content sources and stay updated",
      icon: <RssIcon className="h-6 w-6 text-orange-600" />,
      enabled: false,
    },
    {
      id: "cloud_storage",
      name: "Cloud Storage",
      description: "Connect to Google Drive and OneDrive",
      icon: <Cloud className="h-6 w-6 text-sky-600" />,
      enabled: false,
    },
    {
      id: "questionnaires",
      name: "Questionnaires",
      description: "Create and manage surveys and questionnaires",
      icon: <ClipboardList className="h-6 w-6 text-purple-600" />,
      enabled: false,
    },
    {
      id: "music_mastery",
      name: "Music Mastery",
      description: "Track your music practice and progress",
      icon: <Music2Icon className="h-6 w-6 text-pink-600" />,
      enabled: false,
    },
  ]);

  const toggleFeature = (id: string) => {
    setFeatures(
      features.map((feature) =>
        feature.id === id ? { ...feature, enabled: !feature.enabled } : feature
      )
    );
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Convert features array to object of feature toggles
      const featureToggles = features.reduce(
        (acc, feature) => ({
          ...acc,
          [feature.id]: feature.enabled,
        }),
        {}
      );

      // Save user preferences
      const result = await updateUserFeatures(userId, featureToggles, true);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Setup complete",
        description: "Your preferences have been saved",
      });

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-2 flex justify-center">
          <Layers className="h-12 w-12 text-sage-600" />
        </div>
        <h1 className="text-3xl font-bold">Welcome to ContentBoard</h1>
        <p className="mt-2 text-muted-foreground">
          Let&apos;s set up your workspace to match your needs
        </p>
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Choose your features</h2>
            <p className="text-muted-foreground">
              Select which features you&apos;d like to enable. You can change
              these later.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <Card
                key={feature.id}
                className={`cursor-pointer transition-colors ${
                  feature.enabled
                    ? "border-sage-500 bg-sage-50 dark:bg-sage-900/20"
                    : ""
                }`}
                onClick={() => {
                  if (feature.id !== "content_board") {
                    // Don't allow toggling the core feature
                    toggleFeature(feature.id);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-full bg-gray-100 p-2 ${
                          feature.enabled ? "text-sage-600" : "text-gray-500"
                        }`}
                      >
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {feature.name}
                          {feature.id === "content_board" && (
                            <Badge variant="secondary" className="ml-2">
                              Core
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={() => {
                        if (feature.id !== "content_board") {
                          // Don't allow toggling the core feature
                          toggleFeature(feature.id);
                        }
                      }}
                      disabled={feature.id === "content_board"} // Core feature is always enabled
                      aria-label={`Toggle ${feature.name}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Confirm your selections</h2>
            <p className="text-muted-foreground">
              You&apos;ve selected the following features. You can always change
              these later in Settings.
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-4 font-medium">Enabled Features</h3>
            <div className="space-y-2">
              {features
                .filter((f) => f.enabled)
                .map((feature) => (
                  <div key={feature.id} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>{feature.name}</span>
                  </div>
                ))}
            </div>

            <h3 className="mb-4 mt-6 font-medium">Disabled Features</h3>
            <div className="space-y-2">
              {features
                .filter((f) => !f.enabled)
                .map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <span className="h-5 w-5 rounded-full border"></span>
                    <span>{feature.name}</span>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between">
        {step === 2 ? (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
        ) : (
          <div></div>
        )}
        <Button
          onClick={handleContinue}
          disabled={isSubmitting}
          className="bg-sage-600 hover:bg-sage-700"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Saving...
            </>
          ) : step === 1 ? (
            "Continue"
          ) : (
            "Complete Setup"
          )}
        </Button>
      </div>
    </div>
  );
}
