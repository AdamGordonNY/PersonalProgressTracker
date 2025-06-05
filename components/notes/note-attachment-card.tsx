"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, Trash2, Edit, Headphones, Expand, Save } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { EditNoteDialog } from "./edit-note-dialog";
import { RichTextPreview } from "./rich-text-preview";

interface NoteAttachmentCardProps {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
  keywords: string[];
  onUpdate: (title: string, content: string) => Promise<void>;
  onDelete: () => void;
}

export function NoteAttachmentCard({
  id,
  title,
  content,
  updatedAt,
  keywords,
  onUpdate,
  onDelete,
}: NoteAttachmentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async (newTitle: string, newContent: string) => {
    try {
      await onUpdate(newTitle, newContent);
      setIsEditing(false);
      toast({
        title: "Note updated",
        description: "Your changes have been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setIsDeleting(true);
    try {
      onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="border-l-4 border-emerald-500">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                disabled={isDeleting}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="loading loading-spinner" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Last edited: {format(updatedAt, "MMM d, yyyy 'at' h:mm a")}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1 mb-3">
            {keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary">
                <Tag className="h-3 w-3 mr-1" />
                {keyword}
              </Badge>
            ))}
          </div>

          <RichTextPreview
            content={content}
            maxLength={expanded ? undefined : 200}
          />

          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              <Expand className="h-4 w-4 mr-2" />
              {expanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <EditNoteDialog
          id={id}
          title={title}
          content={content}
          open={isEditing}
          onOpenChange={setIsEditing}
          onSave={handleUpdate}
          keywords={keywords}
        />
      )}
    </>
  );
}
