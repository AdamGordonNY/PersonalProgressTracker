"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "@/components/dashboard/kanban-card";
import { Card } from "@/lib/types";
import { cn } from "@/lib/utils";

type KanbanColumnProps = {
  title: string;
  cards: Card[];
  onUpdateCard: (card: Card) => void;
  onDeleteCard: (cardId: string) => void;
};

export function KanbanColumn({ title, cards, onUpdateCard, onDeleteCard }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: title,
  });

  // Define colors for each column state
  const getColumnColor = () => {
    switch (title) {
      case "Ideas":
        return "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800";
      case "Research":
        return "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800";
      case "Scripting":
        return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800";
      case "Recording":
        return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800";
      case "Ready to Publish":
        return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800";
      default:
        return "bg-slate-50 border-slate-200 dark:bg-slate-800/20 dark:border-slate-700";
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-[calc(100vh-12rem)] flex-col rounded-md border p-2 transition-colors",
        getColumnColor(),
        isOver && "ring-2 ring-sage-500"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-100 text-xs text-sage-600 dark:bg-sage-900 dark:text-sage-300">
          {cards.length}
        </span>
      </div>
      
      <div className="flex-1 space-y-2 overflow-y-auto">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard 
              key={card.id} 
              card={card} 
              onUpdateCard={onUpdateCard}
              onDeleteCard={onDeleteCard}
            />
          ))}
        </SortableContext>
        
        {cards.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-muted-foreground/20 text-sm text-muted-foreground">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}