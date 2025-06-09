"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GolfRound, GolfCourse } from "@prisma/client";
import { format } from "date-fns";
import { Icons } from "../icons";

interface RoundListProps {
  rounds: (GolfRound & { course?: GolfCourse })[];
  onSelectRound: (round: GolfRound) => void;
}

export function RoundList({ rounds, onSelectRound }: RoundListProps) {
  const [activeRound, setActiveRound] = useState<string | null>(null);

  const handleSelectRound = (round: GolfRound) => {
    setActiveRound(round.id);
    onSelectRound(round);
  };

  return (
    <div className="bg-card rounded-lg p-4 shadow h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Rounds</h2>
        <Button size="sm" variant="outline">
          <Icons.golf className="h-4 w-4 mr-1" />
          New Round
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-3rem)]">
        {rounds.length === 0 ? (
          <div className="text-center py-8">
            <Icons.golf className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No rounds recorded yet</p>
            <Button className="mt-4">Start a New Round</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {rounds.map((round) => (
              <div
                key={round.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  activeRound === round.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => handleSelectRound(round)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {round.course?.name || "Unknown Course"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(round.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-lg font-bold">{round.totalScore}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                  <div className="flex items-center">
                    <Icons.putt className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{round.totalPutts} putts</span>
                  </div>
                  <div className="flex items-center">
                    <Icons.fairway className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      {round.fairwaysHit}/{round.fairwaysHit}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Icons.green className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{round.greensInReg} GIR</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
