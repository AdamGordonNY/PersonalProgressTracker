"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter,
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/lib/types";
import { Plus, X } from "lucide-react";

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCard: (card: Card) => void;
  statuses: string[];
}

export function AddCardDialog({ 
  open, 
  onOpenChange, 
  onAddCard,
  statuses,
}: AddCardDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(statuses[0]);
  const [keywords, setKeywords] = useState<{id: string, name: string}[]>([]);
  const [newKeyword, setNewKeyword] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;

    const newCard: Card = {
      id: `new-${Date.now()}`,
      title,
      description,
      status,
      keywords,
      attachments: [],
      factSources: [],
    };

    onAddCard(newCard);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus(statuses[0]);
    setKeywords([]);
    setNewKeyword("");
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      const keywordExists = keywords.some(
        (k) => k.name.toLowerCase() === newKeyword.toLowerCase()
      );

      if (!keywordExists) {
        setKeywords([
          ...keywords,
          { id: `temp-${Date.now()}`, name: newKeyword },
        ]);
      }
      setNewKeyword("");
    }
  };

  const removeKeyword = (keywordId: string) => {
    setKeywords(keywords.filter((k) => k.id !== keywordId));
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Content</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief description..."
              className="min-h-[100px]"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {statuses.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Keywords</Label>
            <div className="flex flex-wrap gap-1">
              {keywords.map((keyword) => (
                <Badge
                  key={keyword.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {keyword.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full hover:bg-destructive/90 hover:text-destructive-foreground"
                    onClick={() => removeKeyword(keyword.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addKeyword}
                disabled={!newKeyword.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()} className="bg-sage-600 hover:bg-sage-700">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}