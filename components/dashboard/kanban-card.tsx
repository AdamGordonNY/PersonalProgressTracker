"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Card } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { CardDialog } from "@/components/dashboard/card-dialog";
import { Card as CardUI, CardContent } from "@/components/ui/card";
import { Tag } from "lucide-react";
import { useBoard } from "@/lib/store";

interface KanbanCardProps {
  card: Card & {
    keywords: { id: string; name: string }[];
  };
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
          {card.keywords && card.keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {card.keywords.map((keyword) => (
                <Badge
                  key={keyword.id}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  <Tag className="h-3 w-3" />
                  {keyword.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </CardUI>

      <CardDialog
        card={{
          ...card,
          keywords: card.keywords?.map((keyword) => ({
            ...keyword,
            cardId: card.id,
          })),
          factSources: (card as any).factSources ?? [],
          attachments: (card as any).attachments ?? [],
        }}
        open={open}
        onOpenChange={setOpen}
        onUpdateCard={updateCard}
        onDeleteCard={deleteCard}
      />
    </>
  );
}
