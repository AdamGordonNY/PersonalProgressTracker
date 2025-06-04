"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NoteTemplate {
  id: string;
  title: string;
  content: string;
  category: "research" | "content" | "planning";
  description: string;
}

interface NoteTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate: (template: { title: string; content: string }) => void;
}

// Predefined templates
const TEMPLATES: NoteTemplate[] = [
  {
    id: "research-outline",
    title: "Research Outline",
    category: "research",
    description: "A structured outline for gathering research on a topic",
    content: `<h2>Research Outline</h2>
<p>Topic: [Your topic]</p>
<h3>Key Questions</h3>
<ul>
  <li>Question 1?</li>
  <li>Question 2?</li>
  <li>Question 3?</li>
</ul>
<h3>Sources to Check</h3>
<ul>
  <li>Source 1</li>
  <li>Source 2</li>
  <li>Source 3</li>
</ul>
<h3>Notes</h3>
<p>Add your research notes here...</p>`,
  },
  {
    id: "interview-prep",
    title: "Interview Preparation",
    category: "research",
    description: "Prepare questions and logistics for an interview",
    content: `<h2>Interview Preparation</h2>
<p>Interviewee: [Name]</p>
<p>Date/Time: [Schedule]</p>
<h3>Background</h3>
<ul>
  <li>Relevant background point 1</li>
  <li>Relevant background point 2</li>
</ul>
<h3>Questions</h3>
<ol>
  <li>Interview question 1?</li>
  <li>Interview question 2?</li>
  <li>Interview question 3?</li>
</ol>
<h3>Follow-up Topics</h3>
<ul>
  <li>Topic 1</li>
  <li>Topic 2</li>
</ul>`,
  },
  {
    id: "content-outline",
    title: "Content Outline",
    category: "content",
    description: "Outline structure for content creation",
    content: `<h2>Content Outline</h2>
<p>Title: [Your title]</p>
<p>Target Audience: [Audience]</p>
<h3>Introduction</h3>
<ul>
  <li>Hook: </li>
  <li>Context: </li>
  <li>Thesis: </li>
</ul>
<h3>Main Points</h3>
<ol>
  <li>
    <p><strong>Point 1</strong></p>
    <ul>
      <li>Supporting detail</li>
      <li>Evidence</li>
    </ul>
  </li>
  <li>
    <p><strong>Point 2</strong></p>
    <ul>
      <li>Supporting detail</li>
      <li>Evidence</li>
    </ul>
  </li>
  <li>
    <p><strong>Point 3</strong></p>
    <ul>
      <li>Supporting detail</li>
      <li>Evidence</li>
    </ul>
  </li>
</ol>
<h3>Conclusion</h3>
<ul>
  <li>Summary: </li>
  <li>Call to action: </li>
</ul>`,
  },
  {
    id: "fact-check",
    title: "Fact-Check Notes",
    category: "content",
    description: "Structure for fact-checking and verification",
    content: `<h2>Fact-Check Notes</h2>
<h3>Claim to Verify</h3>
<p>[State the claim here]</p>
<h3>Sources</h3>
<ul>
  <li><strong>Source 1:</strong> [Citation] - [Findings]</li>
  <li><strong>Source 2:</strong> [Citation] - [Findings]</li>
</ul>
<h3>Verification Status</h3>
<p>☐ Verified ☐ Partly Verified ☐ Unverified ☐ Disputed</p>
<h3>Notes</h3>
<p>Additional context or nuances about this fact...</p>`,
  },
  {
    id: "project-plan",
    title: "Project Plan",
    category: "planning",
    description: "Structured project plan with milestones",
    content: `<h2>Project Plan</h2>
<p>Project: [Name]</p>
<p>Deadline: [Date]</p>
<h3>Objectives</h3>
<ul>
  <li>Objective 1</li>
  <li>Objective 2</li>
</ul>
<h3>Milestones</h3>
<ol>
  <li>
    <p><strong>Milestone 1</strong> - [Date]</p>
    <ul>
      <li>Task 1</li>
      <li>Task 2</li>
    </ul>
  </li>
  <li>
    <p><strong>Milestone 2</strong> - [Date]</p>
    <ul>
      <li>Task 1</li>
      <li>Task 2</li>
    </ul>
  </li>
</ol>
<h3>Resources Needed</h3>
<ul>
  <li>Resource 1</li>
  <li>Resource 2</li>
</ul>`,
  },
  {
    id: "meeting-notes",
    title: "Meeting Notes",
    category: "planning",
    description: "Structure for capturing meeting discussions",
    content: `<h2>Meeting Notes</h2>
<p>Date: [Date]</p>
<p>Attendees: [Names]</p>
<h3>Agenda</h3>
<ol>
  <li>Topic 1</li>
  <li>Topic 2</li>
  <li>Topic 3</li>
</ol>
<h3>Discussion</h3>
<ul>
  <li><strong>Topic 1:</strong> Notes about the discussion...</li>
  <li><strong>Topic 2:</strong> Notes about the discussion...</li>
</ul>
<h3>Action Items</h3>
<ul>
  <li>[Person] will [action] by [date]</li>
  <li>[Person] will [action] by [date]</li>
</ul>
<h3>Next Meeting</h3>
<p>Date/Time: [Schedule]</p>`,
  },
];

export function NoteTemplateDialog({
  open,
  onOpenChange,
  onUseTemplate,
}: NoteTemplateDialogProps) {
  const [activeCategory, setActiveCategory] = useState<string>("research");

  const filteredTemplates = TEMPLATES.filter(
    (template) => template.category === activeCategory
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Note Templates</DialogTitle>
        </DialogHeader>

        <Tabs
          defaultValue="research"
          value={activeCategory}
          onValueChange={setActiveCategory}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-4">
                    <h3 className="font-medium">{template.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <div
                      className="mt-2 max-h-32 overflow-hidden text-xs text-muted-foreground opacity-70"
                      dangerouslySetInnerHTML={{
                        __html: template.content.substring(0, 150) + "...",
                      }}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end p-4 pt-0">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onUseTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
