"use client";

import { useState } from "react";
import { Plus, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeedList } from "@/components/feed-manager/feed-list";
import { AddFeedDialog } from "@/components/feed-manager/add-feed-dialog";
import { NotificationCenter } from "@/components/notifications/notification-center";

export function FeedManager() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">RSS Feed Monitor</h1>
          <p className="text-muted-foreground">
            Track your favorite websites and newsletters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Feed
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <FeedList />
      </div>

      <AddFeedDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onFeedAdded={() => {
          // Trigger feed list refresh
          window.location.reload();
        }}
      />
    </div>
  );
}
