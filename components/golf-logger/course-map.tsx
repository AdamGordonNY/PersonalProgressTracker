"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2 } from "lucide-react";
import { AddCourseDialog } from "@/components/golf-logger/add-course-dialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 40.7128, // New York
  lng: -74.006,
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
};

export function CourseMap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/golf/courses");

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data);

        // Update map center if courses are available
        if (data.length > 0) {
          const sumLat = data.reduce(
            (sum: number, course: any) => sum + course.latitude,
            0
          );
          const sumLng = data.reduce(
            (sum: number, course: any) => sum + course.longitude,
            0
          );

          setMapCenter({
            lat: sumLat / data.length,
            lng: sumLng / data.length,
          });
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load courses. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  // Filter courses based on search query
  const filteredCourses = searchQuery
    ? courses.filter(
        (course) =>
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courses;

  const handleCourseCreated = () => {
    router.refresh();

    // Refetch courses
    fetch("/api/golf/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        toast({
          title: "Success",
          description: "Course added successfully",
        });
      })
      .catch((err) => {
        console.error("Error refetching courses:", err);
      });
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-10 w-64 animate-pulse rounded-md bg-muted"></div>
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted"></div>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <Card>
              <CardHeader>
                <div className="h-6 w-40 animate-pulse rounded-md bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-md bg-muted"
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-8">
            <Card>
              <CardContent className="p-4">
                <div className="h-[500px] animate-pulse rounded-md bg-muted"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center text-center">
          <p className="mb-4 text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search for courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setShowAddCourseDialog(true)}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Golf Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] space-y-2 overflow-y-auto pr-2">
                {filteredCourses.length === 0 ? (
                  <div className="rounded-md border border-dashed p-4 text-center text-muted-foreground">
                    No courses found
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className={`cursor-pointer rounded-md border p-3 transition-colors hover:bg-muted/50 ${
                        selectedCourse?.id === course.id
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedCourse(course);
                        if (
                          mapRef.current &&
                          course.latitude &&
                          course.longitude
                        ) {
                          mapRef.current.panTo({
                            lat: course.latitude,
                            lng: course.longitude,
                          });
                          mapRef.current.setZoom(15);
                        }
                      }}
                    >
                      <h3 className="font-medium">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.location}
                      </p>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {course.holes.length} holes
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card>
            <CardContent className="p-4">
              <LoadScript
                googleMapsApiKey={
                  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
                }
              >
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={mapCenter}
                  zoom={10}
                  options={mapOptions}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                >
                  {courses.map((course) => (
                    <Marker
                      key={course.id}
                      position={{ lat: course.latitude, lng: course.longitude }}
                      title={course.name}
                      onClick={() => setSelectedCourse(course)}
                      icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#059669", // Emerald-600
                        fillOpacity: 0.7,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                      }}
                    />
                  ))}

                  {selectedCourse && (
                    <InfoWindow
                      position={{
                        lat: selectedCourse.latitude,
                        lng: selectedCourse.longitude,
                      }}
                      onCloseClick={() => setSelectedCourse(null)}
                    >
                      <div className="p-1">
                        <h3 className="font-bold">{selectedCourse.name}</h3>
                        <p className="text-sm">{selectedCourse.location}</p>
                        <p className="text-sm">
                          Holes: {selectedCourse.holes.length}
                        </p>
                        <Button
                          size="sm"
                          className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-xs"
                          asChild
                        >
                          <Link href={`/golf/courses/${selectedCourse.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddCourseDialog
        open={showAddCourseDialog}
        onOpenChange={setShowAddCourseDialog}
        onCourseCreated={handleCourseCreated}
      />
    </div>
  );
}
