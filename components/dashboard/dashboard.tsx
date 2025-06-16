"use client";

import { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TimeGuardian } from "@/components/time-guardian/time-guardian";
import { FocusFortress } from "@/components/focus-fortress/focus-fortress";
import { useBoard } from "@/lib/store";
import { Spinner } from "@/components/ui/spinner";
import { Board } from "@prisma/client";
import { BoardsWithColumnsAndCards } from "@/lib/types";
import { useDock } from "@/context/dock-context";
import { FloatingDock } from "../ui/floating-dock";
interface DashboardProps {
  initialData: BoardsWithColumnsAndCards[];
}

export default function Dashboard({ userId }: { userId: string }) {
  const { isLoading, error, fetchBoards, setActiveBoard, getDefaultBoard } =
    useBoard();
  const { items } = useDock();
  useEffect(() => {
    const initialize = async () => {
      await getDefaultBoard();
      await fetchBoards();
    };
    initialize();
  }, []);
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen-dock bg-muted/20">
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4">
          <KanbanBoard />
          <FloatingDock items={items} />
        </main>
      </div>
      <TimeGuardian />
      <FocusFortress />
    </div>
  );
}
