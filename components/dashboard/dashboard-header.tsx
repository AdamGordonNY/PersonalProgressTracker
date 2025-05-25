"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, Search, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useBoard } from "@/lib/store";
import Link from "next/link";
import { BoardEditorDialog } from "./board-editor-dialog";

export function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const { activeBoard } = useBoard();
  const [showBoardEditor, setShowBoardEditor] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-sage-600" />
            <Button
              variant="ghost"
              className="text-xl font-semibold"
              onClick={() => setShowBoardEditor(true)}
            >
              {activeBoard?.title || "Content Board"}
            </Button>
          </div>
          <nav className="ml-4 hidden items-center space-x-4 md:flex">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/feeds"
              className="text-sm font-medium hover:text-primary"
            >
              Feeds
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium hover:text-primary"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm font-medium hover:text-primary"
            >
              Terms
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ThemeToggle />
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <BoardEditorDialog
        open={showBoardEditor}
        onOpenChange={setShowBoardEditor}
      />
    </header>
  );
}
