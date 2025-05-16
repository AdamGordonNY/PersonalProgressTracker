"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag, LayoutDashboard, FileText, CheckSquare, Settings } from "lucide-react";
import { Card } from "@/lib/types";

type SidebarProps = {
  onFilterByKeyword: (keyword: string | null) => void;
  activeFilter: string | null;
  cards: Card[];
};

export function Sidebar({ onFilterByKeyword, activeFilter, cards }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract unique keywords from all cards
  const allKeywords = Array.from(
    new Set(
      cards.flatMap(card => card.keywords.map(keyword => keyword.name))
    )
  ).sort();

  return (
    <div 
      className={`bg-muted/40 transition-all duration-300 ${
        isCollapsed ? "w-[70px]" : "w-[240px]"
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && <h2 className="text-sm font-semibold">Navigation</h2>}
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
              <path d="m9 18 6-6-6-6"/>
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
              <path d="m15 18-6-6 6-6"/>
            </svg>
          )}
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {!isCollapsed && <span>Dashboard</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
          >
            <FileText className="mr-2 h-4 w-4" />
            {!isCollapsed && <span>Content</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            {!isCollapsed && <span>Fact Check</span>}
          </Button>
        </div>

        {!isCollapsed && (
          <>
            <Separator className="my-4" />
            <div className="space-y-1">
              <h3 className="mb-2 text-xs font-medium">Filter by Keyword</h3>
              <Button
                variant={activeFilter === null ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => onFilterByKeyword(null)}
              >
                <span>All Content</span>
              </Button>
              {allKeywords.map((keyword) => (
                <Button
                  key={keyword}
                  variant={activeFilter === keyword ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onFilterByKeyword(keyword)}
                >
                  <Tag className="mr-2 h-3 w-3" />
                  <span className="truncate">{keyword}</span>
                </Button>
              ))}
            </div>
          </>
        )}

        {isCollapsed && (
          <div className="mt-4 flex flex-col items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Tags"
              onClick={() => setIsCollapsed(false)}
            >
              <Tag className="h-4 w-4" />
            </Button>
          </div>
        )}

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