"use client";

import { useState } from "react";
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
import { Card } from "@prisma/client";
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
  onUpdateCard: (
    cardId: string,
    data: { title: string; description?: string; keywords?: string[] }
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSave = () => {
    onUpdateCard(card.id, {
      title: editedCard.title,
      description: editedCard.description!,
      keywords: [], // Add keywords handling
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDeleteCard(card.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
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
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="details" className="flex items-center gap-1">
                <Info className="h-4 w-4" /> Details
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="flex items-center gap-1"
              >
                <FileText className="h-4 w-4" /> Resources
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
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div>
                <Label>Resources</Label>
                <p className="text-sm text-muted-foreground">
                  Coming soon: Attach files and links to your content.
                </p>
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
              <Button
                onClick={handleSave}
                className="bg-sage-600 hover:bg-sage-700"
              >
                Save Changes
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
