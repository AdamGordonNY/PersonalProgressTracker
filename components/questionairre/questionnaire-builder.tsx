"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { QuestionType, FrequencyType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GripVertical, Plus, Trash2, Save, Eye, PenSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createQuestionnaire,
  updateQuestionnaire,
  QuestionInput,
  QuestionnaireInput,
} from "../../actions/questionnaire";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QuestionnaireBuilderProps {
  initialData?: {
    id?: string;
    title: string;
    description?: string;
    frequency?: FrequencyType;
    boardId?: string;
    questions: QuestionInput[];
  };
  onSave?: (questionnaire: any) => void;
}

export function QuestionnaireBuilder({
  initialData,
  onSave,
}: QuestionnaireBuilderProps) {
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [frequency, setFrequency] = useState<FrequencyType>(
    initialData?.frequency || FrequencyType.ONCE
  );
  const [questions, setQuestions] = useState<QuestionInput[]>(
    initialData?.questions || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Add a new question
  const addQuestion = () => {
    const newQuestion: QuestionInput = {
      text: "New Question",
      type: QuestionType.TEXT,
      options: [],
      order: questions.length,
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  // Update a question
  const updateQuestion = (index: number, data: Partial<QuestionInput>) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], ...data };
    setQuestions(updatedQuestions);
  };

  // Remove a question
  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Update order of remaining questions
    updatedQuestions.forEach((q, i) => {
      q.order = i;
    });
    setQuestions(updatedQuestions);
  };

  // Handle drag end for reordering questions
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex(
        (q) => `question-${q.order}` === active.id
      );
      const newIndex = questions.findIndex(
        (q) => `question-${q.order}` === over.id
      );

      const updatedQuestions = [...questions];
      const [movedItem] = updatedQuestions.splice(oldIndex, 1);
      updatedQuestions.splice(newIndex, 0, movedItem);

      // Update order values
      updatedQuestions.forEach((q, i) => {
        q.order = i;
      });

      setQuestions(updatedQuestions);
    }
  };

  // Save questionnaire
  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one question is required",
        variant: "destructive",
      });
      return;
    }

    const data: QuestionnaireInput = {
      title,
      description,
      frequency,
      questions: questions.map((q, index) => ({
        ...q,
        order: index,
      })),
    };

    setIsSaving(true);

    try {
      const result = initialData?.id
        ? await updateQuestionnaire(initialData.id, data)
        : await createQuestionnaire(data);

      if ("error" in result) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: `Questionnaire ${initialData?.id ? "updated" : "created"} successfully`,
      });

      if (onSave) {
        onSave(result.questionnaire);
      }
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      toast({
        title: "Error",
        description: `Failed to ${initialData?.id ? "update" : "create"} questionnaire`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Questionnaire Builder</h2>
          <p className="text-muted-foreground">
            Create and customize your questionnaire
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-[400px]"
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <PenSquare className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="ml-2 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <TabsContent value="edit" className="mt-0 space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter questionnaire title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter questionnaire description"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={frequency}
                      onValueChange={(value: FrequencyType) =>
                        setFrequency(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={FrequencyType.ONCE}>Once</SelectItem>
                        <SelectItem value={FrequencyType.DAILY}>
                          Daily
                        </SelectItem>
                        <SelectItem value={FrequencyType.WEEKLY}>
                          Weekly
                        </SelectItem>
                        <SelectItem value={FrequencyType.MONTHLY}>
                          Monthly
                        </SelectItem>
                        <SelectItem value={FrequencyType.QUARTERLY}>
                          Quarterly
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={questions.map((q) => `question-${q.order}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  <AnimatePresence>
                    {questions.map((question, index) => (
                      <SortableQuestion
                        key={`question-${question.order}`}
                        id={`question-${question.order}`}
                        question={question}
                        index={index}
                        updateQuestion={updateQuestion}
                        removeQuestion={removeQuestion}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>

            <Button
              onClick={addQuestion}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </TabsContent>
        </div>

        <div>
          <TabsContent value="preview" className="mt-0">
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="mx-auto max-w-lg space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">
                      {title || "Untitled Questionnaire"}
                    </h2>
                    {description && (
                      <p className="mt-2 text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-6">
                    {questions.map((question, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {index + 1}. {question.text}
                          </p>
                          {question.required && (
                            <Badge variant="outline" className="text-red-500">
                              Required
                            </Badge>
                          )}
                        </div>

                        {/* Different input types based on question type */}
                        {question.type === QuestionType.TEXT && (
                          <Textarea
                            placeholder="Your answer"
                            className="min-h-[80px]"
                            disabled
                          />
                        )}

                        {question.type === QuestionType.MULTIPLE_CHOICE && (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className="flex items-center space-x-2"
                              >
                                <input type="radio" disabled />
                                <Label>{option}</Label>
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === QuestionType.CHECKBOX && (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className="flex items-center space-x-2"
                              >
                                <input type="checkbox" disabled />
                                <Label>{option}</Label>
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === QuestionType.RATING && (
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Button
                                key={rating}
                                variant="outline"
                                size="sm"
                                disabled
                              >
                                {rating}
                              </Button>
                            ))}
                          </div>
                        )}

                        {question.type === QuestionType.DATE && (
                          <Input type="date" disabled />
                        )}

                        {question.type === QuestionType.SLIDER && (
                          <div className="space-y-2">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              className="w-full"
                              disabled
                            />
                            <div className="flex justify-between text-xs">
                              <span>0</span>
                              <span>50</span>
                              <span>100</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {questions.length > 0 && (
                    <Button className="w-full" disabled>
                      Submit
                    </Button>
                  )}

                  {questions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground">
                        No questions added yet
                      </p>
                      <Button
                        variant="link"
                        onClick={() => setActiveTab("edit")}
                        className="mt-2"
                      >
                        Add some questions to see the preview
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </div>
  );
}

// Sortable Question Component
function SortableQuestion({
  id,
  question,
  index,
  updateQuestion,
  removeQuestion,
}: {
  id: string;
  question: QuestionInput;
  index: number;
  updateQuestion: (index: number, data: Partial<QuestionInput>) => void;
  removeQuestion: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  // For multiple choice and checkbox questions
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    if (newOption.trim()) {
      updateQuestion(index, {
        options: [...question.options, newOption.trim()],
      });
      setNewOption("");
    }
  };

  const removeOption = (optionIndex: number) => {
    const updatedOptions = question.options.filter((_, i) => i !== optionIndex);
    updateQuestion(index, { options: updatedOptions });
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "rounded-lg border bg-card shadow-sm",
        isDragging && "opacity-50"
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 hover:bg-muted"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            value={question.text}
            onChange={(e) => updateQuestion(index, { text: e.target.value })}
            placeholder="Question text"
            className="flex-1"
          />
          <Button
            variant="destructive"
            size="icon"
            onClick={() => removeQuestion(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={question.type}
              onValueChange={(value: QuestionType) =>
                updateQuestion(index, {
                  type: value,
                  options: value === QuestionType.TEXT ? [] : question.options,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuestionType.TEXT}>Text</SelectItem>
                <SelectItem value={QuestionType.MULTIPLE_CHOICE}>
                  Multiple Choice
                </SelectItem>
                <SelectItem value={QuestionType.CHECKBOX}>Checkbox</SelectItem>
                <SelectItem value={QuestionType.RATING}>Rating</SelectItem>
                <SelectItem value={QuestionType.DATE}>Date</SelectItem>
                <SelectItem value={QuestionType.SLIDER}>Slider</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={`required-${index}`}
                checked={question.required}
                onCheckedChange={(checked) =>
                  updateQuestion(index, { required: checked })
                }
              />
              <Label htmlFor={`required-${index}`}>Required</Label>
            </div>
          </div>
        </div>

        {/* Options for Multiple Choice and Checkbox questions */}
        {(question.type === QuestionType.MULTIPLE_CHOICE ||
          question.type === QuestionType.CHECKBOX) && (
          <div className="mt-4 space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const updatedOptions = [...question.options];
                      updatedOptions[optIndex] = e.target.value;
                      updateQuestion(index, { options: updatedOptions });
                    }}
                    placeholder={`Option ${optIndex + 1}`}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(optIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add new option"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addOption();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={!newOption.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Additional settings for Rating type */}
        {question.type === QuestionType.RATING && (
          <div className="mt-4">
            <Label>Rating Scale (1-5)</Label>
            <div className="flex space-x-2 mt-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button key={rating} variant="outline" size="sm" disabled>
                  {rating}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Additional settings for Slider type */}
        {question.type === QuestionType.SLIDER && (
          <div className="mt-4 space-y-2">
            <Label>Slider Range (0-100)</Label>
            <input type="range" min="0" max="100" className="w-full" disabled />
            <div className="flex justify-between text-xs">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
