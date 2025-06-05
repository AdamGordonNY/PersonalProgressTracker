"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PostureTip {
  id: number;
  title: string;
  content: string;
  category: string;
}

const POSTURE_TIPS: PostureTip[] = [
  {
    id: 1,
    title: "The 20-20-20 Rule",
    content:
      "Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain and neck tension.",
    category: "prevention",
  },
  {
    id: 2,
    title: "Desk Setup",
    content:
      "Your monitor should be at eye level, with your keyboard and mouse positioned so your elbows form a 90° angle.",
    category: "ergonomics",
  },
  {
    id: 3,
    title: "Chair Height",
    content:
      "Adjust your chair so your feet rest flat on the floor and your knees form a 90° angle.",
    category: "ergonomics",
  },
  {
    id: 4,
    title: "Shoulder Rolls",
    content:
      "Roll your shoulders backward in a circular motion 10 times, then forward 10 times to relieve tension.",
    category: "exercise",
  },
  {
    id: 5,
    title: "Neck Stretches",
    content:
      "Gently tilt your head toward each shoulder, holding for 15-30 seconds on each side.",
    category: "exercise",
  },
  {
    id: 6,
    title: "Wrist Relief",
    content:
      "Extend your arm with palm up, then pull fingers back toward your body with the other hand. Hold for 15-30 seconds.",
    category: "exercise",
  },
  {
    id: 7,
    title: "Stand Up",
    content:
      "Try to stand up and move around for at least 2 minutes every hour to improve circulation.",
    category: "prevention",
  },
  {
    id: 8,
    title: "Monitor Position",
    content:
      "The top of your monitor should be at or slightly below eye level, and about an arm's length away.",
    category: "ergonomics",
  },
  {
    id: 9,
    title: "Hydration",
    content:
      "Stay well-hydrated to keep your spinal discs healthy and maintain good posture throughout the day.",
    category: "prevention",
  },
  {
    id: 10,
    title: "Core Strengthening",
    content:
      "Regular exercises that strengthen your core muscles help maintain good posture naturally.",
    category: "exercise",
  },
];

export function PostureTips() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [filter, setFilter] = useState<string | null>(null);

  // Apply filter if set
  const filteredTips = filter
    ? POSTURE_TIPS.filter((tip) => tip.category === filter)
    : POSTURE_TIPS;

  // Ensure current index is valid for the filtered list
  const validIndex = Math.min(currentTipIndex, filteredTips.length - 1);
  const currentTip = filteredTips[validIndex];

  // Handle navigation
  const nextTip = () => {
    setCurrentTipIndex((prev) =>
      prev < filteredTips.length - 1 ? prev + 1 : 0
    );
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) =>
      prev > 0 ? prev - 1 : filteredTips.length - 1
    );
  };

  // Get category name for display
  const getCategoryName = (category: string) => {
    switch (category) {
      case "prevention":
        return "Prevention";
      case "ergonomics":
        return "Ergonomics";
      case "exercise":
        return "Exercise";
      default:
        return category;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posture Tips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant={filter === null ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter(null);
              setCurrentTipIndex(0);
            }}
          >
            All
          </Button>
          <Button
            variant={filter === "ergonomics" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter("ergonomics");
              setCurrentTipIndex(0);
            }}
          >
            Ergonomics
          </Button>
          <Button
            variant={filter === "exercise" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter("exercise");
              setCurrentTipIndex(0);
            }}
          >
            Exercises
          </Button>
          <Button
            variant={filter === "prevention" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter("prevention");
              setCurrentTipIndex(0);
            }}
          >
            Prevention
          </Button>
        </div>

        {currentTip && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium">{currentTip.title}</h3>
                <Badge variant="secondary">
                  {getCategoryName(currentTip.category)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentTip.content}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevTip}
                disabled={filteredTips.length <= 1}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <span className="text-xs text-muted-foreground">
                {validIndex + 1} of {filteredTips.length}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={nextTip}
                disabled={filteredTips.length <= 1}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
