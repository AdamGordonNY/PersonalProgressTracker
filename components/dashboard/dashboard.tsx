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
interface DashboardProps {
  initialData: BoardsWithColumnsAndCards[];
}
export default function Dashboard({ userId }: { userId: string }) {
  const { isLoading, error, fetchBoards, setActiveBoard, getDefaultBoard } =
    useBoard();

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
    <div className="flex h-screen bg-muted/20">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-4">
          <KanbanBoard />
        </main>
      </div>
      <TimeGuardian />
      <FocusFortress />
    </div>
  );
}
