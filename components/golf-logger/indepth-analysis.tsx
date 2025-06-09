// src/components/golf/GolfDashboard.tsx
"use client";

import { useState } from "react";

import { GolfRound, GolfCourse } from "@prisma/client";
import { CourseViewer3D } from "@/components/golf-logger/course-viewer-3d";
import { KmlUploader } from "@/components/golf-logger/kml-uploader";
import { RoundList } from "@/components/golf-logger/round-list";
import { ShotAnalysis } from "./shot-analyzer";

interface GolfDashboardProps {
  initialRounds: (GolfRound & { course?: GolfCourse })[];
}

export default function CourseDashboard({ initialRounds }: GolfDashboardProps) {
  const [courseData, setCourseData] = useState<any>(null);
  const [activeRound, setActiveRound] = useState<GolfRound | null>(null);

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg p-4 shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Course Visualization</h2>
              <KmlUploader onUpload={setCourseData} />
            </div>

            {courseData ? (
              <CourseViewer3D kmlData={courseData} />
            ) : (
              <div className="h-[50vh] flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">
                  Import a KML file to visualize the course
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <RoundList rounds={initialRounds} onSelectRound={setActiveRound} />
        </div>
      </div>

      {/* Shot analysis panel */}
      {/* Shot analysis panel */}
      {activeRound && (
        <div className="mt-6 bg-card rounded-lg p-4 shadow">
          <ShotAnalysis round={activeRound as any} courseData={courseData} />
        </div>
      )}
    </div>
  );
}
