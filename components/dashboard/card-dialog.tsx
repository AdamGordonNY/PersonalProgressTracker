"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card as PrismaCard } from "@prisma/client";
import type { AttachmentType } from "@prisma/client";
// Extend Card type to include keywords, factSources, and attachments
type Keyword = { id: string; name: string; cardId: string };
type FactSource = {
  id: string;
  title: string;
  url: string;
  quote?: string;
  cardId: string;
  screenshot: string | null;
};

type Attachment = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  url: string | null;
  type: AttachmentType;
  content: string | null;
  fileType: string;
  provider: string | null;
  cardId: string;
};

type Card = PrismaCard & {
  keywords: Keyword[];
  factSources: FactSource[];
  attachments: Attachment[];
};
import {
  Trash2,
  Plus,
  Link,
  FileText,
  Info,
  Tag,
  X,
  Paperclip,
  Loader2,
  Save,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createAttachment,
  deleteAttachment,
  updateAttachment,
} from "@/actions/attachment";
import { AttachmentManager } from "../notes/attachment-manager";

interface CardDialogProps {
  card: Card;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCard: (
    cardId: string,
    data: {
      title: string;
      description?: string;
      keywords?: string[];
      factSources?: { title: string; url: string; quote?: string }[];
    }
  ) => void;
  onDeleteCard: (cardId: string) => void;
}

export function CardDialog({
  card,
  open,
  onOpenChange,
  onUpdateCard,
  onDeleteCard,
}: CardDialogProps) {
  const [editedCard, setEditedCard] = useState<Card>({ ...card });
  const [newKeyword, setNewKeyword] = useState("");
  const [newFactSource, setNewFactSource] = useState({
    title: "",
    url: "",
    quote: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [attachments, setAttachments] = useState<
    (Attachment & { user: { name: string | null } })[]
  >(
    (card.attachments || []).map((a) => ({
      ...a,
      user: { name: null }, // Default user if missing
    }))
  );
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const fetchAttachments = async () => {
    setIsLoadingAttachments(true);
    try {
      const response = await fetch(`/api/cards/${card.id}/attachments`);
      if (!response.ok) throw new Error("Failed to fetch attachments");
      const data = await response.json();
      setAttachments(
        data.map((a: Attachment & { user?: { name: string | null } }) => ({
          ...a,
          user: a.user ?? { name: null },
        }))
      );
    } catch (error) {
      console.error("Error fetching attachments:", error);
    } finally {
      setIsLoadingAttachments(false);
    }
  };
  useEffect(() => {
    setAttachments(
      (card.attachments || []).map((a) => ({
        ...a,
        user: { name: null },
      }))
    );
  }, [card]);
  // Fetch attachments when the dialog opens
  useEffect(() => {
    if (open) {
      fetchAttachments();
    }
  }, [open, card.id]);

  const handleSave = () => {
    setIsSubmitting(true);
    onUpdateCard(card.id, {
      title: editedCard.title,
      description: editedCard.description!,
      keywords: editedCard.keywords?.map((k) => k.name) || [],
      factSources:
        editedCard.factSources?.map((s) => ({
          title: s.title,
          url: s.url || "",
          quote: s.quote || "",
        })) || [],
    });
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDeleteCard(card.id);
    onUpdateCard(card.id, {
      title: editedCard.title,
      description: editedCard.description!,
      keywords: editedCard.keywords?.map((k) => k.name) || [],
      factSources:
        editedCard.factSources?.map((s) => ({
          title: s.title,
          url: s.url || "",
          quote: s.quote || "",
        })) || [],
    });
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  const addKeyword = () => {
    if (
      newKeyword.trim() &&
      !editedCard.keywords?.some((k) => k.name === newKeyword.trim())
    ) {
      setEditedCard({
        ...editedCard,
        keywords: [
          ...(editedCard.keywords || []),
          {
            id: Date.now().toString(),
            name: newKeyword.trim(),
            cardId: card.id,
          },
        ],
      });
      setNewKeyword("");
    }
  };

  const removeKeyword = (keywordId: string) => {
    setEditedCard({
      ...editedCard,
      keywords: editedCard.keywords?.filter((k) => k.id !== keywordId) || [],
    });
  };

  const addFactSource = () => {
    if (newFactSource.title.trim() && newFactSource.url.trim()) {
      setEditedCard({
        ...editedCard,
        factSources: [
          ...(editedCard.factSources || []),
          {
            id: Date.now().toString(),
            title: newFactSource.title.trim(),
            url: newFactSource.url.trim(),
            quote: newFactSource.quote.trim(),
            cardId: card.id,
            screenshot: null,
          },
        ],
      });
      setNewFactSource({ title: "", url: "", quote: "" });
    }
  };

  const removeFactSource = (sourceId: string) => {
    setEditedCard({
      ...editedCard,
      factSources:
        editedCard.factSources?.filter((s) => s.id !== sourceId) || [],
    });
  };
  const handleCreateAttachment = async (data: any) => {
    try {
      const result = await createAttachment({
        ...data,
        cardId: card.id,
      });

      if ("error" in result) {
        throw new Error(result.error);
      }

      // UPDATE local state
      setAttachments((prev) => [
        ...prev,
        {
          ...result.attachment,
          url: result.attachment.url ?? "",
          user: { name: null }, // Ensure user property is present
        },
      ]);
    } catch (error) {
      console.error("Error creating attachment:", error);
      throw error;
    }
  };

  const handleUpdateAttachment = async (id: string, data: any) => {
    try {
      const result = await updateAttachment(id, data);

      if ("error" in result) {
        throw new Error(result.error);
      }

      // UPDATE local state
      setAttachments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...data } : a))
      );
    } catch (error) {
      console.error("Error updating attachment:", error);
      throw error;
    }
  };
  const handleDeleteAttachment = async (id: string) => {
    try {
      const result = await deleteAttachment(id);

      if ("error" in result) {
        throw new Error(result.error);
      }

      // UPDATE local state
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting attachment:", error);
      throw error;
    }
  };
  const keywordNames = editedCard.keywords?.map((k) => k.name) || [];
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <Input
                value={editedCard.title}
                onChange={(e) =>
                  setEditedCard({ ...editedCard, title: e.target.value })
                }
                className="mb-2 mt-1 text-xl font-bold"
              />
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="flex items-center gap-1">
                <Info className="h-4 w-4" /> Details
              </TabsTrigger>
              <TabsTrigger value="sources" className="flex items-center gap-1">
                <Link className="h-4 w-4" /> Sources
              </TabsTrigger>
              <TabsTrigger
                value="attachments"
                className="flex items-center gap-1"
              >
                <Paperclip className="h-4 w-4" /> Attachments
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editedCard.description || ""}
                  onChange={(e) =>
                    setEditedCard({
                      ...editedCard,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 min-h-[200px]"
                  placeholder="Add detailed notes about this content..."
                />
              </div>

              <div>
                <Label>Keywords</Label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {editedCard.keywords?.map((keyword) => (
                    <Badge
                      key={keyword.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />
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
                <div className="mt-2 flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={addKeyword}
                    disabled={!newKeyword.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sources" className="space-y-4">
              <div>
                <Label>Fact Sources</Label>
                <div className="mt-2 space-y-2">
                  {editedCard.factSources?.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div>
                        <h4 className="font-medium">{source.title}</h4>
                        <a
                          href={source.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:underline"
                        >
                          {source.url}
                        </a>
                        {source.quote && (
                          <p className="mt-2 text-sm italic text-muted-foreground">
                            &quot;{source.quote}&quot;
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFactSource(source.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <Input
                    placeholder="Source title"
                    value={newFactSource.title}
                    onChange={(e) =>
                      setNewFactSource({
                        ...newFactSource,
                        title: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={newFactSource.url}
                    onChange={(e) =>
                      setNewFactSource({
                        ...newFactSource,
                        url: e.target.value,
                      })
                    }
                  />
                  <Textarea
                    placeholder="Quote (optional)"
                    value={newFactSource.quote}
                    onChange={(e) =>
                      setNewFactSource({
                        ...newFactSource,
                        quote: e.target.value,
                      })
                    }
                  />
                  <Button
                    onClick={addFactSource}
                    disabled={
                      !newFactSource.title.trim() || !newFactSource.url.trim()
                    }
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Source
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              <AttachmentManager
                cardId={card.id}
                attachments={attachments}
                onCreateAttachment={handleCreateAttachment}
                onUpdateAttachment={handleUpdateAttachment}
                onDeleteAttachment={handleDeleteAttachment}
                keywords={keywordNames} // Pass string array
              />
            </TabsContent>
          </Tabs>

          <div className="mt-4 flex justify-between">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>

              <Button
                onClick={handleSave}
                className="bg-sage-600 hover:bg-sage-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save Changes</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this content card. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
