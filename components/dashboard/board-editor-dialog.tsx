"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoard } from "@/lib/store";
import { Column } from "@prisma/client";
import { Plus, X } from "lucide-react";

interface BoardEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BoardEditorDialog({
  open,
  onOpenChange,
}: BoardEditorDialogProps) {
  const { activeBoard, columns, updateBoard, updateColumn } = useBoard();
  const [title, setTitle] = useState(activeBoard?.title || "");
  const [editedColumns, setEditedColumns] = useState<Column[]>(columns);

  const handleSave = async () => {
    if (!activeBoard?.id) return;

    // Update board title
    await updateBoard(activeBoard.id, { title });

    // Update column titles
    for (const column of editedColumns) {
      if (column.title !== columns.find((c) => c.id === column.id)?.title) {
        await updateColumn(column.id, { title: column.title });
      }
    }

    onOpenChange(false);
  };

  const updateColumnTitle = (columnId: string, newTitle: string) => {
    setEditedColumns(
      editedColumns.map((col) =>
        col.id === columnId ? { ...col, title: newTitle } : col
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Board</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Board Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter board title"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Columns</Label>
            <div className="mt-1.5 space-y-2">
              {editedColumns.map((column) => (
                <div key={column.id} className="flex items-center gap-2">
                  <Input
                    value={column.title}
                    onChange={(e) =>
                      updateColumnTitle(column.id, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
