"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, Plus, Settings } from "lucide-react";
import { useBoard } from "@/lib/store";
import { Board } from "@prisma/client";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { boards, activeBoard, setActiveBoard, createBoard } = useBoard();

  const handleCreateBoard = () => {
    createBoard({
      title: "New Board",
      description: "A new content board",
    });
  };

  return (
    <div
      className={`bg-muted/40 transition-all duration-300 ${
        isCollapsed ? "w-[70px]" : "w-[240px]"
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && <h2 className="text-sm font-semibold">Boards</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto h-8 w-8"
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          )}
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
        <div className="space-y-1">
          {boards.map((board) => (
            <Button
              key={board.id}
              variant={activeBoard?.id === board.id ? "secondary" : "ghost"}
              className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
              onClick={() => setActiveBoard(board.id)}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {!isCollapsed && <span className="truncate">{board.title}</span>}
            </Button>
          ))}
          <Button
            variant="ghost"
            className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
            onClick={handleCreateBoard}
          >
            <Plus className="mr-2 h-4 w-4" />
            {!isCollapsed && <span>New Board</span>}
          </Button>
        </div>

        <Separator className="my-4" />

        <div className={`mt-auto pt-4 ${isCollapsed ? "text-center" : ""}`}>
          <Button
            variant="ghost"
            className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
          >
            <Settings className="mr-2 h-4 w-4" />
            {!isCollapsed && <span>Settings</span>}
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
