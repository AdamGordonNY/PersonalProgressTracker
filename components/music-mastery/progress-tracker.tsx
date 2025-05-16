"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Skill {
  id: string;
  name: string;
  status: 'Mastered' | 'In Progress' | 'To Learn';
  type: 'Chord' | 'Scale';
}

export function ProgressTracker() {
  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'C Major Scale', status: 'Mastered', type: 'Scale' },
    { id: '2', name: 'G Major Scale', status: 'In Progress', type: 'Scale' },
    { id: '3', name: 'D Minor Scale', status: 'To Learn', type: 'Scale' },
    { id: '4', name: 'Cmaj7', status: 'Mastered', type: 'Chord' },
    { id: '5', name: 'Dm7', status: 'In Progress', type: 'Chord' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Mastered':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
      case 'In Progress':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
      default:
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300';
    }
  };

  const updateSkillStatus = (skillId: string, newStatus: string) => {
    setSkills(skills.map(skill =>
      skill.id === skillId
        ? { ...skill, status: newStatus as Skill['status'] }
        : skill
    ));
  };

  return (
    <Card className="p-4">
      <h2 className="mb-4 font-semibold">Progress Tracker</h2>
      <div className="space-y-3">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <div className="font-medium">{skill.name}</div>
              <Badge variant="secondary" className="mt-1">
                {skill.type}
              </Badge>
            </div>
            <Select
              value={skill.status}
              onValueChange={(value) => updateSkillStatus(skill.id, value)}
            >
              <SelectTrigger className={`w-[140px] ${getStatusColor(skill.status)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mastered">Mastered</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="To Learn">To Learn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </Card>
  );
}