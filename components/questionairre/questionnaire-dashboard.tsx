"use client";

import { useState, useEffect } from "react";
import { FrequencyType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList,
  Plus,
  Search,
  FileDown,
  Eye,
  PieChart,
  Edit2,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  getQuestionnaires,
  deleteQuestionnaire,
} from "@/actions/questionnaire";
import { getResponsesStats } from "@/actions/response";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  required: boolean;
  order: number;
}

interface Questionnaire {
  id: string;
  title: string;
  description: string | null;
  frequency: FrequencyType;
  userId: string;
  questions: Question[];
  responses: any[];
  createdAt: Date;
  updatedAt: Date;
}

export function QuestionnaireDashboard() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [filteredQuestionnaires, setFilteredQuestionnaires] = useState<
    Questionnaire[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<Questionnaire | null>(null);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch questionnaires
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getQuestionnaires();
        if ("error" in result) {
          throw new Error(result.error);
        }
        setQuestionnaires(result.questionnaires);
        setFilteredQuestionnaires(result.questionnaires);
      } catch (error) {
        console.error("Error fetching questionnaires:", error);
        toast({
          title: "Error",
          description: "Failed to fetch questionnaires",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredQuestionnaires(questionnaires);
      return;
    }

    const filtered = questionnaires.filter(
      (q) =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.description &&
          q.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setFilteredQuestionnaires(filtered);
  }, [searchQuery, questionnaires]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this questionnaire?")) {
      return;
    }

    try {
      const result = await deleteQuestionnaire(id);
      if ("error" in result) {
        throw new Error(result.error);
      }

      setQuestionnaires((prev) => prev.filter((q) => q.id !== id));
      toast({
        title: "Success",
        description: "Questionnaire deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting questionnaire:", error);
      toast({
        title: "Error",
        description: "Failed to delete questionnaire",
        variant: "destructive",
      });
    }
  };

  // Fetch stats for selected questionnaire
  const fetchStats = async (id: string) => {
    setStatsLoading(true);
    try {
      const result = await getResponsesStats(id);
      if ("error" in result) {
        throw new Error(result.error);
      }
      setStats(result.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch statistics",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle showing stats
  const handleShowStats = (questionnaire: Questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setShowStatsDialog(true);
    fetchStats(questionnaire.id);
  };

  // Get frequency display
  const getFrequencyDisplay = (frequency: FrequencyType) => {
    const map: Record<FrequencyType, string> = {
      [FrequencyType.ONCE]: "One-time",
      [FrequencyType.DAILY]: "Daily",
      [FrequencyType.WEEKLY]: "Weekly",
      [FrequencyType.MONTHLY]: "Monthly",
      [FrequencyType.QUARTERLY]: "Quarterly",
    };
    return map[frequency] || frequency;
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Questionnaires</h1>
          <p className="text-muted-foreground">
            Create and manage your questionnaires
          </p>
        </div>
        <Link href="/questionnaires/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Questionnaire
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questionnaires..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-2/3 rounded-md bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 w-full rounded-md bg-muted"></div>
                  <div className="h-4 w-3/4 rounded-md bg-muted"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredQuestionnaires.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredQuestionnaires.map((questionnaire) => (
            <Card
              key={questionnaire.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-1">
                      {questionnaire.title}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        {getFrequencyDisplay(questionnaire.frequency)}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <ClipboardList className="h-3 w-3" />
                        {questionnaire.questions.length} questions
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {questionnaire.description && (
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {questionnaire.description}
                  </p>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Responses</span>
                    <span className="font-medium">
                      {questionnaire.responses.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Last updated
                      </span>
                      <span className="text-sm">
                        {formatDate(questionnaire.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/questionnaires/${questionnaire.id}/edit`)
                      }
                      className="gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowStats(questionnaire)}
                      className="gap-1"
                    >
                      <PieChart className="h-3 w-3" />
                      Stats
                    </Button>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/questionnaires/${questionnaire.id}`)
                      }
                      className="gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(questionnaire.id)}
                      className="gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed">
          <ClipboardList className="mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="font-medium">No questionnaires found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery
              ? "Try a different search term"
              : "Create your first questionnaire to get started"}
          </p>
        </div>
      )}

      {/* Statistics Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Questionnaire Statistics</DialogTitle>
          </DialogHeader>
          {selectedQuestionnaire && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {selectedQuestionnaire.title}
              </h3>

              {statsLoading ? (
                <div className="space-y-4">
                  <div className="h-6 w-full animate-pulse rounded-md bg-muted"></div>
                  <div className="h-6 w-3/4 animate-pulse rounded-md bg-muted"></div>
                </div>
              ) : stats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Total Responses
                          </p>
                          <p className="text-2xl font-bold">
                            {stats.totalResponses}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Completion Rate
                          </p>
                          <p className="text-2xl font-bold">
                            {Math.round(stats.averageCompletionRate * 100)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="w-full">
                      <TabsTrigger value="summary" className="flex-1">
                        Summary
                      </TabsTrigger>
                      <TabsTrigger value="export" className="flex-1">
                        Export Data
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary" className="mt-4">
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="mb-2 font-medium">
                              Response Growth
                            </h4>
                            <div className="h-[200px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                              <p className="text-muted-foreground">
                                Chart visualization would go here
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    <TabsContent value="export" className="mt-4">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="mb-2 font-medium">Export Responses</h4>
                          <p className="mb-4 text-sm text-muted-foreground">
                            Download all responses to this questionnaire as a
                            CSV file.
                          </p>
                          <Button className="gap-2 w-full" asChild>
                            <a
                              href={`/api/questionnaires/${selectedQuestionnaire.id}/export`}
                              download={`${selectedQuestionnaire.title.replace(/\s+/g, "_")}_responses.csv`}
                            >
                              <FileDown className="h-4 w-4" />
                              Download CSV
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <p>No statistics available</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
