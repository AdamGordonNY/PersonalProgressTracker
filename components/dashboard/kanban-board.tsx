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
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "@/components/dashboard/kanban-column";
import { KanbanCard } from "@/components/dashboard/kanban-card";
import { AddCardDialog } from "@/components/dashboard/add-card-dialog";
import { Card as CardType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type KanbanBoardProps = {
  cards: CardType[];
  columns: string[];
  onCardStatusChange: (cardId: string, newStatus: string) => void;
  onAddCard: (card: CardType) => void;
  onUpdateCard: (card: CardType) => void;
  onDeleteCard: (cardId: string) => void;
};

export function KanbanBoard({
  cards,
  columns,
  onCardStatusChange,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Find the active card if there is one
  const activeCard = activeId ? cards.find((c) => c.id === activeId) || null : null;

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
    // Implementation for reordering within columns could be added here
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const isCard = active.id.toString().includes('-');
      if (isCard && over.id) {
        // If we're dropping onto a column
        if (!over.id.toString().includes('-')) {
          // Change the card's status
          onCardStatusChange(active.id as string, over.id as string);
        }
      }
    }
    
    setActiveId(null);
  };

  // Group cards by status
  const cardsByColumn = columns.reduce((acc, column) => {
    acc[column] = cards.filter((card) => card.status === column);
    return acc;
  }, {} as Record<string, CardType[]>);

  return (
    <div className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-sage-700 dark:text-sage-300">Content Board</h1>
        <Button onClick={() => setShowAddDialog(true)} className="gap-1 bg-sage-600 hover:bg-sage-700">
          <Plus className="h-4 w-4" /> Add New Content
        </Button>
      </div>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {columns.map((column) => (
            <KanbanColumn 
              key={column} 
              title={column} 
              cards={cardsByColumn[column] || []}
              onUpdateCard={onUpdateCard}
              onDeleteCard={onDeleteCard}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId && activeCard ? (
            <div className="w-[250px]">
              <KanbanCard 
                card={activeCard} 
                onUpdateCard={onUpdateCard}
                onDeleteCard={onDeleteCard}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddCardDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onAddCard={onAddCard}
        statuses={columns}
      />
    </div>
  );
}