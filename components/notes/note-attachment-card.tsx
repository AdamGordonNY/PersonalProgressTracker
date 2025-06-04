"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileEdit, Trash2, Tag, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/rich-text/rich-text-editor";
import DOMPurify from "isomorphic-dompurify";

interface NoteAttachmentCardProps {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
  keywords?: { id: string; name: string }[];
  expanded?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdate?: (content: string) => Promise<void>;
}

export function NoteAttachmentCard({
  id,
  title,
  content,
  updatedAt,
  keywords = [],
  expanded = false,
  onEdit,
  onDelete,
  onUpdate,
}: NoteAttachmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showFullView, setShowFullView] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sanitize the content to prevent XSS
  const sanitizedContent = DOMPurify.sanitize(content);

  // Format the date
  const formattedDate = format(new Date(updatedAt), "MMM d, yyyy h:mm a");

  const handleUpdate = async (newContent: string) => {
    if (onUpdate) {
      try {
        await onUpdate(newContent);
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating note:", error);
      }
    }
  };

  return (
    <>
      <Card
        className={cn(
          "transition-all duration-200 hover:shadow-md",
          isExpanded && "border-primary/50"
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <h3 className="font-medium">{title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div
            className={cn(
              "mt-2 overflow-hidden text-sm text-muted-foreground",
              isExpanded ? "max-h-none" : "max-h-24 line-clamp-3"
            )}
          >
            <div
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              className="prose-sm max-w-none dark:prose-invert"
            />
          </div>

          {keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {keywords.map((keyword) => (
                <Badge
                  key={keyword.id}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  <Tag className="h-3 w-3" />
                  {keyword.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t p-2 px-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Edited {formattedDate}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowFullView(true)}
              title="Full view"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
              title="Edit"
            >
              <FileEdit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={onDelete}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Full View Dialog */}
      <Dialog open={showFullView} onOpenChange={setShowFullView}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            className="prose max-w-none dark:prose-invert overflow-y-auto max-h-[60vh] py-2"
          />

          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {keywords.map((keyword) => (
                <Badge
                  key={keyword.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Tag className="h-3 w-3" />
                  {keyword.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-2 text-xs text-muted-foreground">
            Last edited: {formattedDate}
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowFullView(false);
                setIsEditing(true);
              }}
              className="gap-2"
            >
              <FileEdit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>

          <RichTextEditor
            initialContent={content}
            onSave={handleUpdate}
            adhd={true}
            toolbar="full"
            className="min-h-[400px]"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
