"use client";

import { useState } from 'react';
import { Search, Tag, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Excerpt {
  id: string;
  text: string;
  source: string;
  tags: string[];
}

export function QuickReference() {
  const [searchQuery, setSearchQuery] = useState('');
  const [excerpts] = useState<Excerpt[]>([
    {
      id: '1',
      text: "Content that resonates with your audience should be both informative and engaging...",
      source: "Content Strategy Guide 2025",
      tags: ['strategy', 'engagement'],
    },
    {
      id: '2',
      text: "Social media analytics show that video content receives 2x more engagement...",
      source: "Social Media Analytics",
      tags: ['social-media', 'metrics'],
    },
  ]);

  const filteredExcerpts = excerpts.filter(excerpt =>
    excerpt.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    excerpt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card>
      <div className="border-b p-4">
        <h2 className="font-semibold">Quick Reference</h2>
        <p className="text-sm text-muted-foreground">
          Your saved excerpts and highlights
        </p>
      </div>
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search excerpts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[calc(100vh-35rem)]">
          <div className="space-y-4">
            {filteredExcerpts.map((excerpt) => (
              <div
                key={excerpt.id}
                className="rounded-lg border bg-card p-4"
              >
                <p className="text-sm">{excerpt.text}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  From: {excerpt.source}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {excerpt.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="gap-1"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}