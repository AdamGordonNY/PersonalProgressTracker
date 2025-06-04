"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { Attachment, FactSource, AttachmentType } from "@prisma/client";
import {
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  StickyNote,
  Plus,
  Search,
  FileEdit,
  Trash2,
} from "lucide-react";
import { NoteAttachmentCard } from "@/components/notes/note-attachment-card";
import { AddNoteDialog } from "@/components/notes/add-note-dialog";
import { FactSourceCard } from "@/components/notes/fact-source-card";
import { NoteTemplateDialog } from "@/components/notes/note-template-dialog";
import { useToast } from "@/hooks/use-toast";
import { useCard } from "@/hooks/use-card";
import { format } from "date-fns";

interface AttachmentManagerProps {
  cardId: string;
  attachments: (Attachment & { user: { name: string | null } })[];
  factSources: FactSource[];
  onCreateAttachment: (data: any) => Promise<void>;
  onUpdateAttachment: (id: string, data: any) => Promise<void>;
  onDeleteAttachment: (id: string) => Promise<void>;
  onCreateFactSource: (data: any) => Promise<void>;
  onUpdateFactSource: (id: string, data: any) => Promise<void>;
  onDeleteFactSource: (id: string) => Promise<void>;
}

export function AttachmentManager({
  cardId,
  attachments,
  factSources,
  onCreateAttachment,
  onUpdateAttachment,
  onDeleteAttachment,
  onCreateFactSource,
  onUpdateFactSource,
  onDeleteFactSource,
}: AttachmentManagerProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [sortedAttachments, setSortedAttachments] = useState<Attachment[]>([]);
  const { toast } = useToast();
  const { keywords = [] } = useCard(cardId) || {};

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Update sorted attachments when attachments change
  useEffect(() => {
    setSortedAttachments(attachments);
  }, [attachments]);

  // Filter attachments based on search and active tab
  const filteredAttachments = sortedAttachments.filter((attachment) => {
    // Filter by search query
    const matchesQuery =
      attachment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attachment.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    // Filter by tab
    if (activeTab === "all") {
      return matchesQuery;
    } else if (activeTab === "notes") {
      return attachment.type === AttachmentType.NOTE && matchesQuery;
    } else if (activeTab === "files") {
      return attachment.type === AttachmentType.FILE && matchesQuery;
    } else if (activeTab === "links") {
      return attachment.type === AttachmentType.LINK && matchesQuery;
    } else if (activeTab === "images") {
      return attachment.type === AttachmentType.IMAGE && matchesQuery;
    }

    return matchesQuery;
  });

  // Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Find indices of dragged and dropped items
    const oldIndex = sortedAttachments.findIndex((att) => att.id === active.id);
    const newIndex = sortedAttachments.findIndex((att) => att.id === over.id);

    // Create new array with updated order
    const newAttachments = [...sortedAttachments];
    const [movedItem] = newAttachments.splice(oldIndex, 1);
    newAttachments.splice(newIndex, 0, movedItem);

    // Update state
    setSortedAttachments(newAttachments);

    // Here you would typically call an API to persist the new order
    // For now we'll just log it
    console.log(
      "Reordered attachments:",
      newAttachments.map((a) => a.id)
    );
  };

  // Handle adding a new note
  const handleAddNote = async (data: { title: string; content: string }) => {
    try {
      await onCreateAttachment({
        name: data.title,
        content: data.content,
        type: AttachmentType.NOTE,
        fileType: "note/html",
        cardId,
      });

      toast({
        title: "Note added",
        description: "Your note has been added to the card",
      });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  // Update a note attachment
  const handleUpdateNote = async (id: string, content: string) => {
    try {
      await onUpdateAttachment(id, { content });

      toast({
        title: "Note updated",
        description: "Your note has been updated",
      });
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  // Delete an attachment
  const handleDeleteAttachment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    try {
      await onDeleteAttachment(id);

      toast({
        title: "Attachment deleted",
        description: "The attachment has been removed",
      });
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "destructive",
      });
    }
  };

  // Use a note template
  const handleUseTemplate = (template: { title: string; content: string }) => {
    setShowTemplateDialog(false);

    // Pre-fill the add note dialog
    handleAddNote(template);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Attachments & References</h3>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowTemplateDialog(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Template
          </Button>

          <Button
            variant="default"
            size="sm"
            className="gap-1"
            onClick={() => setShowAddNoteDialog(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Note
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search attachments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-1">
            <StickyNote className="h-3.5 w-3.5" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" />
            Files
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-1">
            <LinkIcon className="h-3.5 w-3.5" />
            Links
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-1">
            <ImageIcon className="h-3.5 w-3.5" />
            Images
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredAttachments.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {filteredAttachments.length > 0 ? (
                    filteredAttachments.map((attachment) => (
                      <SortableAttachmentItem
                        key={attachment.id}
                        attachment={attachment}
                        onUpdate={(content) =>
                          handleUpdateNote(attachment.id, content)
                        }
                        onEdit={() => {}}
                        onDelete={() => handleDeleteAttachment(attachment.id)}
                        keywords={keywords}
                      />
                    ))
                  ) : (
                    <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed text-center">
                      <p className="text-sm text-muted-foreground">
                        No attachments found
                      </p>
                      {searchQuery ? (
                        <p className="text-xs text-muted-foreground">
                          Try a different search term
                        </p>
                      ) : (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => setShowAddNoteDialog(true)}
                          className="mt-2"
                        >
                          Add your first note or attachment
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </SortableContext>
          </DndContext>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredAttachments.length > 0 ? (
                filteredAttachments.map((attachment) => (
                  <NoteAttachmentCard
                    key={attachment.id}
                    id={attachment.id}
                    title={attachment.name}
                    content={attachment.content || ""}
                    updatedAt={attachment.updatedAt}
                    keywords={keywords}
                    onEdit={() => {}}
                    onDelete={() => handleDeleteAttachment(attachment.id)}
                    onUpdate={(content) =>
                      handleUpdateNote(attachment.id, content)
                    }
                  />
                ))
              ) : (
                <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed text-center">
                  <p className="text-sm text-muted-foreground">
                    No notes found
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowAddNoteDialog(true)}
                    className="mt-2"
                  >
                    Add your first note
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        {["files", "links", "images"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-4">
            <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed text-center">
              <p className="text-sm text-muted-foreground">
                No {tabValue} found
              </p>
              <Button variant="link" size="sm" className="mt-2">
                Add {tabValue}
              </Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialogs */}
      <AddNoteDialog
        open={showAddNoteDialog}
        onOpenChange={setShowAddNoteDialog}
        onSave={handleAddNote}
        keywords={keywords}
      />

      <NoteTemplateDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}

// Sortable wrapper for attachment items
function SortableAttachmentItem({
  attachment,
  onUpdate,
  onEdit,
  onDelete,
  keywords,
}: {
  attachment: any;
  onUpdate: (content: string) => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
  keywords: any[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: attachment.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  // Render different attachment types
  const renderAttachment = () => {
    switch (attachment.type) {
      case AttachmentType.NOTE:
        return (
          <NoteAttachmentCard
            id={attachment.id}
            title={attachment.name}
            content={attachment.content || ""}
            updatedAt={attachment.updatedAt}
            keywords={keywords}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        );

      case AttachmentType.FACT_SOURCE:
        return (
          <FactSourceCard
            id={attachment.id}
            title={attachment.name}
            url={attachment.url || ""}
            quote={attachment.content || ""}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );

      case AttachmentType.FILE:
      case AttachmentType.LINK:
      case AttachmentType.IMAGE:
      default:
        // Generic attachment card for other types
        return (
          <div className="rounded-lg border p-3 hover:bg-muted/50">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <div className="rounded bg-muted p-2">
                  {attachment.type === AttachmentType.FILE && (
                    <FileText className="h-4 w-4" />
                  )}
                  {attachment.type === AttachmentType.LINK && (
                    <LinkIcon className="h-4 w-4" />
                  )}
                  {attachment.type === AttachmentType.IMAGE && (
                    <ImageIcon className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{attachment.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    Added by {attachment.user?.name || "Unknown"} on{" "}
                    {format(new Date(attachment.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onEdit}
                >
                  <FileEdit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {renderAttachment()}
    </div>
  );
}
