"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Card } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CardDialog } from "@/components/dashboard/card-dialog";
import { Card as CardUI, CardContent } from "@/components/ui/card";
import { Paperclip, Link } from "lucide-react";

interface KanbanCardProps {
  card: Card;
  onUpdateCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
}

export function KanbanCard({ card, onUpdateCard, onDeleteCard }: KanbanCardProps) {
  const [open, setOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasAttachments = card.attachments && card.attachments.length > 0;
  const hasFactSources = card.factSources && card.factSources.length > 0;

  return (
    <>
      <CardUI
        ref={setNodeRef}
        style={style}
        className="cursor-grab border bg-background shadow-sm transition-all hover:ring-1 hover:ring-sage-400 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-3">
          <h4 className="font-medium">{card.title}</h4>
          {card.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {card.description}
            </p>
          )}
          {card.keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {card.keywords.map((keyword) => (
                <Badge
                  key={keyword.id}
                  variant="outline"
                  className="inline-flex items-center rounded-full border bg-muted/50 px-2 py-0.5 text-xs"
                >
                  {keyword.name}
                </Badge>
              ))}
            </div>
          )}
          {(hasAttachments || hasFactSources) && (
            <div className="mt-2 flex gap-2 text-muted-foreground">
              {hasAttachments && (
                <div className="flex items-center gap-1 text-xs">
                  <Paperclip className="h-3 w-3" />
                  <span>{card.attachments.length}</span>
                </div>
              )}
              {hasFactSources && (
                <div className="flex items-center gap-1 text-xs">
                  <Link className="h-3 w-3" />
                  <span>{card.factSources.length}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </CardUI>

      <CardDialog
        card={card}
        open={open}
        onOpenChange={setOpen}
        onUpdateCard={onUpdateCard}
        onDeleteCard={onDeleteCard}
      />
    </>
  );
}