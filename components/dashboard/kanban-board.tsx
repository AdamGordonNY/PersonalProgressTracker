"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { KanbanColumn } from "@/components/dashboard/kanban-column";
import { KanbanCard } from "@/components/dashboard/kanban-card";
import { AddCardDialog } from "@/components/dashboard/add-card-dialog";
import { Card } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBoard } from "@/lib/store";

export function KanbanBoard() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { columns, cards, reorderCards, reorderColumns, activeBoard } =
    useBoard();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === "card";
    const isOverACard = over.data.current?.type === "card";

    if (!isActiveACard) return;

    // Dropping a card over another card
    if (isActiveACard && isOverACard) {
      const activeIndex = cards.findIndex((card) => card.id === activeId);
      const overIndex = cards.findIndex((card) => card.id === overId);

      if (cards[activeIndex].columnId !== cards[overIndex].columnId) {
        // Card is being moved to a different column
        const updates = cards.map((card) => {
          if (card.id === activeId) {
            return {
              id: card.id,
              columnId: cards[overIndex].columnId,
              order: overIndex,
            };
          }
          return { id: card.id, columnId: card.columnId, order: card.order };
        });
        reorderCards(updates);
      }
    }

    // Dropping a card over a column
    if (isActiveACard && !isOverACard) {
      const activeIndex = cards.findIndex((card) => card.id === activeId);
      const updates = cards.map((card) => {
        if (card.id === activeId) {
          return { id: card.id, columnId: overId as string, order: -1 };
        }
        return { id: card.id, columnId: card.columnId, order: card.order };
      });
      reorderCards(updates);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      const isColumn = active.data.current?.type === "column";

      if (isColumn) {
        const oldIndex = columns.findIndex((col) => col.id === active.id);
        const newIndex = columns.findIndex((col) => col.id === over.id);

        const updates = columns.map((col, index) => ({
          id: col.id,
          order:
            index === oldIndex
              ? newIndex
              : index === newIndex
                ? oldIndex
                : index,
        }));

        reorderColumns(updates);
      }
    }

    setActiveId(null);
  };

  return (
    <div className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-sage-700 dark:text-sage-300">
          Content Board
        </h1>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="gap-1 bg-sage-600 hover:bg-sage-700"
        >
          <Plus className="h-4 w-4" /> Add New Content
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={cards.filter((card) => card.columnId === column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId && (
            <div className="w-[250px]">
              <KanbanCard
                card={{
                  ...(cards.find((card) => card.id === activeId) as Card),
                  keywords: [],
                }}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <AddCardDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        columns={columns}
      />
    </div>
  );
}
