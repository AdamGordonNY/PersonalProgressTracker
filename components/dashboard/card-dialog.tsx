"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, FactSource, Attachment } from "@/lib/types";
import { Trash2, Plus, Link, FileText, Info } from "lucide-react";
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

interface CardDialogProps {
  card: Card;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
}

export function CardDialog({ card, open, onOpenChange, onUpdateCard, onDeleteCard }: CardDialogProps) {
  const [editedCard, setEditedCard] = useState<Card>({ ...card });
  const [newKeyword, setNewKeyword] = useState("");
  const [newSource, setNewSource] = useState<Partial<FactSource>>({
    title: "",
    url: "",
    quote: "",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newAttachment, setNewAttachment] = useState<Partial<Attachment>>({
    name: "",
    url: "",
    fileType: "pdf",
    provider: "GoogleDrive",
  });

  const handleSave = () => {
    onUpdateCard(editedCard);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDeleteCard(card.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      const keywordExists = editedCard.keywords.some(
        (k) => k.name.toLowerCase() === newKeyword.toLowerCase()
      );

      if (!keywordExists) {
        setEditedCard({
          ...editedCard,
          keywords: [
            ...editedCard.keywords,
            { id: `temp-${Date.now()}`, name: newKeyword },
          ],
        });
      }
      setNewKeyword("");
    }
  };

  const removeKeyword = (keywordId: string) => {
    setEditedCard({
      ...editedCard,
      keywords: editedCard.keywords.filter((k) => k.id !== keywordId),
    });
  };

  const addFactSource = () => {
    if (newSource.title) {
      setEditedCard({
        ...editedCard,
        factSources: [
          ...editedCard.factSources,
          {
            id: `temp-${Date.now()}`,
            title: newSource.title,
            url: newSource.url || null,
            quote: newSource.quote || null,
            screenshot: null,
            cardId: card.id,
          } as FactSource,
        ],
      });
      setNewSource({ title: "", url: "", quote: "" });
    }
  };

  const removeFactSource = (sourceId: string) => {
    setEditedCard({
      ...editedCard,
      factSources: editedCard.factSources.filter((s) => s.id !== sourceId),
    });
  };

  const addAttachment = () => {
    if (newAttachment.name && newAttachment.url) {
      setEditedCard({
        ...editedCard,
        attachments: [
          ...editedCard.attachments,
          {
            id: `temp-${Date.now()}`,
            name: newAttachment.name,
            url: newAttachment.url,
            fileType: newAttachment.fileType || "pdf",
            provider: newAttachment.provider || "GoogleDrive",
            cardId: card.id,
            createdAt: new Date(),
          } as Attachment,
        ],
      });
      setNewAttachment({
        name: "",
        url: "",
        fileType: "pdf",
        provider: "GoogleDrive",
      });
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setEditedCard({
      ...editedCard,
      attachments: editedCard.attachments.filter((a) => a.id !== attachmentId),
    });
  };

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
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="details" className="flex items-center gap-1">
                <Info className="h-4 w-4" /> Details
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> Resources
              </TabsTrigger>
              <TabsTrigger value="fact-check" className="flex items-center gap-1">
                <Link className="h-4 w-4" /> Fact Check
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div>
                <Label>Description/Notes</Label>
                <Textarea
                  value={editedCard.description || ""}
                  onChange={(e) =>
                    setEditedCard({ ...editedCard, description: e.target.value })
                  }
                  className="mt-1 min-h-[200px]"
                  placeholder="Add detailed notes, script ideas, and other information about this content..."
                />
              </div>

              <div>
                <Label>Keywords</Label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {editedCard.keywords.map((keyword) => (
                    <Badge
                      key={keyword.id}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {keyword.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full text-muted-foreground hover:bg-destructive/90 hover:text-destructive-foreground"
                        onClick={() => removeKeyword(keyword.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
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
                    variant="secondary"
                    size="sm"
                    onClick={addKeyword}
                    disabled={!newKeyword.trim()}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <Label className="text-lg font-medium">Attachments</Label>
                </div>
                
                <div className="space-y-2">
                  {editedCard.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                          {attachment.fileType === "pdf" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                              <path d="M9 15h6"/>
                              <path d="M9 11h6"/>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15V6m0 0H2v13h10"/>
                              <circle cx="16" cy="16" r="3"/>
                              <circle cx="8" cy="6" r="2"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {attachment.provider}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {editedCard.attachments.length === 0 && (
                    <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                      No attachments yet
                    </div>
                  )}

                  <div className="mt-4 space-y-2 rounded-md border p-3">
                    <Label className="text-sm">Add New Attachment</Label>
                    <div className="grid gap-2">
                      <Input
                        placeholder="File name"
                        value={newAttachment.name}
                        onChange={(e) =>
                          setNewAttachment({
                            ...newAttachment,
                            name: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="File URL from Google Drive or OneDrive"
                        value={newAttachment.url}
                        onChange={(e) =>
                          setNewAttachment({
                            ...newAttachment,
                            url: e.target.value,
                          })
                        }
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">File Type</Label>
                          <select
                            value={newAttachment.fileType}
                            onChange={(e) =>
                              setNewAttachment({
                                ...newAttachment,
                                fileType: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          >
                            <option value="pdf">PDF</option>
                            <option value="audio">Audio</option>
                            <option value="video">Video</option>
                            <option value="image">Image</option>
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs">Provider</Label>
                          <select
                            value={newAttachment.provider}
                            onChange={(e) =>
                              setNewAttachment({
                                ...newAttachment,
                                provider: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          >
                            <option value="GoogleDrive">Google Drive</option>
                            <option value="OneDrive">OneDrive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="mt-2 w-full bg-sage-600 hover:bg-sage-700"
                      size="sm"
                      onClick={addAttachment}
                      disabled={!newAttachment.name || !newAttachment.url}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Attachment
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fact-check" className="space-y-4">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <Label className="text-lg font-medium">Fact-Check Hub</Label>
                </div>
                
                <div className="space-y-2">
                  {editedCard.factSources.map((source) => (
                    <div
                      key={source.id}
                      className="rounded-md border p-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{source.title}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFactSource(source.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {source.url && (
                        <div className="mt-1 text-sm">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                          >
                            <Link className="h-3 w-3" /> {source.url}
                          </a>
                        </div>
                      )}
                      {source.quote && (
                        <div className="mt-2 rounded-md bg-muted p-2 text-sm italic">
                          "{source.quote}"
                        </div>
                      )}
                    </div>
                  ))}

                  {editedCard.factSources.length === 0 && (
                    <div className="flex h-20 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                      No fact sources yet
                    </div>
                  )}

                  <div className="mt-4 space-y-2 rounded-md border p-3">
                    <Label className="text-sm">Add New Source</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Source title"
                        value={newSource.title}
                        onChange={(e) =>
                          setNewSource({ ...newSource, title: e.target.value })
                        }
                      />
                      <Input
                        placeholder="URL (optional)"
                        value={newSource.url}
                        onChange={(e) =>
                          setNewSource({ ...newSource, url: e.target.value })
                        }
                      />
                      <Textarea
                        placeholder="Relevant quote (optional)"
                        value={newSource.quote}
                        onChange={(e) =>
                          setNewSource({ ...newSource, quote: e.target.value })
                        }
                        className="min-h-[80px]"
                      />
                    </div>
                    <Button
                      className="mt-2 w-full bg-sage-600 hover:bg-sage-700"
                      size="sm"
                      onClick={addFactSource}
                      disabled={!newSource.title}
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add Source
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 flex justify-between">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-sage-600 hover:bg-sage-700">Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this content card and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}