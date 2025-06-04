"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tag, Plus, Save, Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/rich-text/rich-text-editor";

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; content: string }) => Promise<void>;
  keywords?: { id: string; name: string }[];
}

export function AddNoteDialog({
  open,
  onOpenChange,
  onSave,
  keywords = [],
}: AddNoteDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsSaving(true);

    try {
      await onSave({
        title: title.trim(),
        content,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
  };

  // Add keyword to the note content
  const addKeywordToContent = (keyword: string) => {
    // This could be improved to insert at cursor position
    // but for simplicity we'll append to the end
    setContent((prevContent) => {
      return `${prevContent}<p><strong>#${keyword}</strong></p>`;
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetForm();
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Note</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
          </div>

          {keywords.length > 0 && (
            <div className="space-y-2">
              <Label>Keywords</Label>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <Badge
                    key={keyword.id}
                    variant="outline"
                    className="flex cursor-pointer items-center gap-1 hover:bg-muted"
                    onClick={() => addKeywordToContent(keyword.name)}
                  >
                    <Tag className="h-3 w-3" />
                    <span>{keyword.name}</span>
                    <Plus className="h-3 w-3" />
                  </Badge>
                ))}
                <span className="text-xs text-muted-foreground">
                  Click to add keyword to note
                </span>
              </div>
            </div>
          )}

          <div>
            <Label>Content</Label>
            <div className="mt-2 h-[300px] border rounded-md">
              <RichTextEditor
                initialContent={content}
                onChange={setContent}
                placeholder="Write your note here..."
                adhd={true}
                readabilityScore={true}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || !title.trim()}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Note
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
