"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Card } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { CardDialog } from "@/components/dashboard/card-dialog";
import { Card as CardUI, CardContent } from "@/components/ui/card";
import { Paperclip, Link } from "lucide-react";
import { useBoard } from "@/lib/store";

interface KanbanCardProps {
  card: Card;
}

export function KanbanCard({ card }: KanbanCardProps) {
  const [open, setOpen] = useState(false);
  const { updateCard, deleteCard } = useBoard();

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
        </CardContent>
      </CardUI>

      <CardDialog
        card={card}
        open={open}
        onOpenChange={setOpen}
        onUpdateCard={updateCard}
        onDeleteCard={deleteCard}
      />
    </>
  );
}
