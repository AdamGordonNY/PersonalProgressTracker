"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useBoard } from "@/lib/store";

export function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const { activeBoard } = useBoard();

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-sage-600" />
            <span className="text-xl font-semibold">
              {activeBoard?.title || "Content Board"}
            </span>
          </div>
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
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}
