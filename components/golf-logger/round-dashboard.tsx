// src/components/golf/GolfDashboard.tsx
"use client";

import { useState } from "react";
import { KmlUploader } from "./kml-uploader";
import { CourseViewer3D } from "./course-viewer-3d";
import { RoundList } from "./round-list";

export function RoundDashboard({ initialRounds }: { initialRounds: any[] }) {
  const [courseData, setCourseData] = useState<any>(null);
  const [activeRound, setActiveRound] = useState<any>(null);

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
          <RoundList
            rounds={initialRounds}
            onSelectRound={(round) => {
              setActiveRound(round);
              // Load round-specific KML if available
            }}
          />
        </div>
      </div>

      {/* Shot analysis panel */}
      {activeRound && (
        <div className="mt-6 bg-card rounded-lg p-4 shadow">
          <h3 className="text-lg font-semibold mb-3">Shot Analysis</h3>
          {/* Analysis components */}
        </div>
      )}
    </div>
  );
}
