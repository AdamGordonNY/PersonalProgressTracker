"use client";

import { useState } from 'react';
import { Plus, Save, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Tip {
  id: string;
  title: string;
  content: string;
  tags: string[];
  date: string;
}

export function TipsSection() {
  const [tips, setTips] = useState<Tip[]>([
    {
      id: '1',
      title: 'Driver Alignment',
      content: 'Keep left arm straight, rotate hips fully on backswing',
      tags: ['driving', 'technique'],
      date: '2025-03-15',
    },
    {
      id: '2',
      title: 'Putting Grip Pressure',
      content: 'Light grip pressure, let the putter head do the work',
      tags: ['putting', 'grip'],
      date: '2025-03-14',
    },
  ]);
  const [newTip, setNewTip] = useState({ title: '', content: '', tag: '' });
  const [showForm, setShowForm] = useState(false);

  const handleAddTag = () => {
    if (newTip.tag.trim()) {
      setNewTip({
        ...newTip,
        tag: '',
      });
    }
  };

  const handleSave = () => {
    if (newTip.title && newTip.content) {
      setTips([
        ...tips,
        {
          id: Date.now().toString(),
          title: newTip.title,
          content: newTip.content,
          tags: [],
          date: new Date().toISOString().split('T')[0],
        },
      ]);
      setNewTip({ title: '', content: '', tag: '' });
      setShowForm(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Swing Tips & Notes</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Tip
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border bg-emerald-50 p-4 dark:bg-emerald-950">
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Tip title"
                value={newTip.title}
                onChange={(e) => setNewTip({ ...newTip, title: e.target.value })}
              />
            </div>
            <div>
              <Textarea
                placeholder="Tip content..."
                value={newTip.content}
                onChange={(e) => setNewTip({ ...newTip, content: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag"
                value={newTip.tag}
                onChange={(e) => setNewTip({ ...newTip, tag: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} variant="outline">
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="mr-2 h-4 w-4" />
                Save Tip
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {tips.map((tip) => (
          <Card key={tip.id} className="p-4">
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-medium">{tip.title}</h3>
              <span className="text-sm text-muted-foreground">
                {new Date(tip.date).toLocaleDateString()}
              </span>
            </div>
            <p className="mb-3 text-muted-foreground">{tip.content}</p>
            <div className="flex flex-wrap gap-2">
              {tip.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}