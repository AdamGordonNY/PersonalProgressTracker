// components/notes/edit-note-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text/rich-text-editor";
import { useToast } from "@/hooks/use-toast";

interface EditNoteDialogProps {
  id: string;
  title: string;
  content: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string, content: string) => Promise<void>;
  keywords: string[];
}

export function EditNoteDialog({
  id,
  title,
  content,
  open,
  onOpenChange,
  onSave,
  keywords,
}: EditNoteDialogProps) {
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!editedTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editedTitle, editedContent);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Note title"
            />
          </div>

          <div>
            <Label>Content</Label>
            <RichTextEditor
              initialContent={editedContent}
              onChange={(html) => setEditedContent(html)}
              placeholder="Write your note content here..."
              autoSave={false}
              toolbar="full"
              className="min-h-[300px] border rounded-md"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
