"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard } from "@/components/dashboard/kanban-card";
import { Card, Column, Keyword } from "@prisma/client";
import { cn } from "@/lib/utils";

type KanbanColumnProps = {
  column: Column;
  cards: (Card & {
    keywords: Keyword[];
    attachments: any[];
    factSources: any[];
  })[];
};

export function KanbanColumn({ column, cards }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  // Define colors for each column state
  const getColumnColor = () => {
    switch (column.title) {
      case "Ideas":
        return "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800";
      case "Research":
        return "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800";
      case "In Progress":
        return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800";
      case "Done":
        return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800";
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
        <h3 className="font-medium">{column.title}</h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-100 text-xs text-sage-600 dark:bg-sage-900 dark:text-sage-300">
          {cards.length}
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard key={card.id} card={card} />
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
