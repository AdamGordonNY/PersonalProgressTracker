"use client";

import { useState, useEffect } from "react";
import { QuestionType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Confetti } from "@/components/ui/confetti";
import { submitResponse, AnswerInput } from "@/actions/response";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Save } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  required: boolean;
  order: number;
}

interface ResponseFormProps {
  questionnaireId: string;
  title: string;
  description?: string;
  questions: Question[];
  onComplete?: () => void;
}

export function ResponseForm({
  questionnaireId,
  title,
  description,
  questions,
  onComplete,
}: ResponseFormProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);
  const currentQuestion = sortedQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / sortedQuestions.length) * 100;

  // Load saved answers from localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem(
      `questionnaire_${questionnaireId}_answers`
    );
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error("Error parsing saved answers:", e);
      }
    }
  }, [questionnaireId]);

  // Autosave every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        localStorage.setItem(
          `questionnaire_${questionnaireId}_answers`,
          JSON.stringify(answers)
        );
        setLastSaved(new Date());
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [questionnaireId, answers]);

  // Handle answer change
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => {
      const updated = { ...prev, [questionId]: value };
      // Also save to localStorage on each change
      localStorage.setItem(
        `questionnaire_${questionnaireId}_answers`,
        JSON.stringify(updated)
      );
      setLastSaved(new Date());
      return updated;
    });
  };

  // Navigate to next question
  const handleNext = () => {
    // If current question is required and not answered, show error
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      toast({
        title: "Required question",
        description: "Please answer this question before proceeding",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestionIndex < sortedQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Submit the response
  const handleSubmit = async () => {
    // Check if all required questions are answered
    const unansweredRequired = sortedQuestions
      .filter((q) => q.required && !answers[q.id])
      .map((q) => q.text);

    if (unansweredRequired.length > 0) {
      toast({
        title: "Required questions",
        description: `Please answer all required questions: ${unansweredRequired.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format answers for API
      const formattedAnswers: AnswerInput[] = Object.entries(answers).map(
        ([questionId, value]) => ({
          questionId,
          value,
        })
      );

      const result = await submitResponse(questionnaireId, formattedAnswers);

      if ("error" in result) {
        throw new Error(result.error);
      }

      // Show success animation
      setShowConfetti(true);

      // Clear localStorage
      localStorage.removeItem(`questionnaire_${questionnaireId}_answers`);

      toast({
        title: "Success",
        description: "Your response has been submitted successfully",
      });

      // Call onComplete callback if provided
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Error",
        description: "Failed to submit your response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render input based on question type
  const renderQuestionInput = (question: Question) => {
    const value = answers[question.id] || "";

    switch (question.type) {
      case QuestionType.TEXT:
        return (
          <Textarea
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Your answer"
            className="min-h-[100px]"
          />
        );

      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`option-${question.id}-${index}`}
                  name={`question-${question.id}`}
                  checked={value === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                  className="h-4 w-4"
                />
                <Label htmlFor={`option-${question.id}-${index}`}>
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case QuestionType.CHECKBOX:
        return (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`option-${question.id}-${index}`}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      handleAnswerChange(question.id, [
                        ...currentValue,
                        option,
                      ]);
                    } else {
                      handleAnswerChange(
                        question.id,
                        currentValue.filter((v) => v !== option)
                      );
                    }
                  }}
                  className="h-4 w-4"
                />
                <Label htmlFor={`option-${question.id}-${index}`}>
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case QuestionType.RATING:
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={value === rating ? "default" : "outline"}
                size="sm"
                onClick={() => handleAnswerChange(question.id, rating)}
              >
                {rating}
              </Button>
            ))}
          </div>
        );

      case QuestionType.DATE:
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );

      case QuestionType.SLIDER:
        return (
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={value || 50}
              onChange={(e) =>
                handleAnswerChange(question.id, parseInt(e.target.value))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs">
              <span>0</span>
              <span>{value || 50}</span>
              <span>100</span>
            </div>
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti />}

      <div>
        <Progress value={progress} className="h-2" />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>
            Question {currentQuestionIndex + 1} of {sortedQuestions.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">{title}</h2>
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
          </div>

          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
              {currentQuestion.required && (
                <Badge variant="outline" className="text-red-500">
                  Required
                </Badge>
              )}
            </div>

            <div className="py-2">{renderQuestionInput(currentQuestion)}</div>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {lastSaved && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Save className="h-3 w-3" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>

              {currentQuestionIndex < sortedQuestions.length - 1 ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Submit
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center">
        <Button
          variant="link"
          onClick={() => setCurrentQuestionIndex(0)}
          className="text-xs"
        >
          Jump to start
        </Button>
      </div>
    </div>
  );
}
