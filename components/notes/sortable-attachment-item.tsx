import { useSortable } from "@dnd-kit/sortable";
import { AttachmentType } from "@prisma/client";
import { NoteAttachmentCard } from "./note-attachment-card";
import { FactSourceCard } from "./fact-source-card";
import { FileEdit, FileText, ImageIcon, LinkIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../ui/button";

export default function SortableAttachmentItem({
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
