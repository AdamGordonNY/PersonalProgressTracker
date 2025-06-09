"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowUpCircle,
  ClipboardList,
  Cloud,
  LayoutDashboard,
  Plus,
  RssIcon,
  Settings,
  WeightIcon,
} from "lucide-react";
import { useBoard } from "@/lib/store";
import { Board } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getUserFeatures } from "@/actions/user";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { boards, activeBoard, setActiveBoard, createBoard } = useBoard();
  const [features, setFeatures] = useState<Record<string, boolean>>({
    content_board: true, // Core feature is always enabled
  });
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true);
  const { user } = useUser();
  const pathname = usePathname();

  const handleCreateBoard = () => {
    createBoard({
      title: "New Board",
      description: "A new content board",
    });
  };
  useEffect(() => {
    const fetchFeatures = async () => {
      if (!user?.id) return;

      try {
        const result = await getUserFeatures(user.id);
        if (!result.error) {
          setFeatures({
            content_board: true, // Always enabled
            ...result.features,
          });
        }
      } catch (error) {
        console.error("Error fetching user features:", error);
      } finally {
        setIsLoadingFeatures(false);
      }
    };

    fetchFeatures();
  }, [user?.id]);
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
          {/* Dashboard Link */}
          <Link href="/dashboard">
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              {!isCollapsed && <span className="truncate">Dashboard</span>}
            </Button>
          </Link>

          {/* Feature-based navigation links */}
          {features.golf_tracker && (
            <Link href="/golf">
              <Button
                variant={pathname.startsWith("/golf") ? "secondary" : "ghost"}
                className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
              >
                <WeightIcon className="mr-2 h-4 w-4" />
                {!isCollapsed && <span className="truncate">Golf Tracker</span>}
              </Button>
            </Link>
          )}

          {features.posture_reminder && (
            <Link href="/posture">
              <Button
                variant={pathname === "/posture" ? "secondary" : "ghost"}
                className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                {!isCollapsed && (
                  <span className="truncate">Posture Guardian</span>
                )}
              </Button>
            </Link>
          )}

          {features.rss_feeds && (
            <Link href="/feeds">
              <Button
                variant={pathname.startsWith("/feeds") ? "secondary" : "ghost"}
                className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
              >
                <RssIcon className="mr-2 h-4 w-4" />
                {!isCollapsed && <span className="truncate">RSS Feeds</span>}
              </Button>
            </Link>
          )}

          {features.cloud_storage && (
            <Link href="/cloud">
              <Button
                variant={pathname === "/cloud" ? "secondary" : "ghost"}
                className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
              >
                <Cloud className="mr-2 h-4 w-4" />
                {!isCollapsed && (
                  <span className="truncate">Cloud Storage</span>
                )}
              </Button>
            </Link>
          )}

          {features.questionnaires && (
            <Link href="/questionnaires">
              <Button
                variant={
                  pathname.startsWith("/questionnaires") ? "secondary" : "ghost"
                }
                className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                {!isCollapsed && (
                  <span className="truncate">Questionnaires</span>
                )}
              </Button>
            </Link>
          )}

          <Separator className="my-4" />

          {/* Boards Section */}
          {!isCollapsed && (
            <h3 className="mb-2 text-xs font-medium text-muted-foreground">
              BOARDS
            </h3>
          )}

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

        <div className={`mt-auto pt-4 ${isCollapsed ? "text-center" : ""}`}>
          <Link href="/settings">
            <Button
              variant="ghost"
              className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
            >
              <Settings className="mr-2 h-4 w-4" />
              {!isCollapsed && <span>Settings</span>}
            </Button>
          </Link>
        </div>
      </ScrollArea>
    </div>
  );
}
