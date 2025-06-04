"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileEdit, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FactSourceCardProps {
  id: string;
  title: string;
  url: string;
  quote?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function FactSourceCard({
  id,
  title,
  url,
  quote,
  onEdit,
  onDelete,
}: FactSourceCardProps) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <h3 className="font-medium">{title}</h3>
          {url && (
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>

        {url && (
          <div className="mt-1 overflow-hidden text-ellipsis text-xs text-muted-foreground">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {url}
            </a>
          </div>
        )}

        {quote && (
          <>
            <Separator className="my-2" />
            <blockquote className="border-l-2 pl-3 italic text-sm text-muted-foreground">
              {quote}
            </blockquote>
          </>
        )}
      </CardContent>

      <CardFooter className="border-t p-2 px-3 flex justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onEdit}
        >
          <FileEdit className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
