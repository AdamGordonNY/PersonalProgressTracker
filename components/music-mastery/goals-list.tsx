"use client";

import { useState } from 'react';
import { Plus, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Goal {
  id: string;
  text: string;
  dueDate: string;
  completed: boolean;
}

export function GoalsList() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      text: 'Learn 3 jazz chords',
      dueDate: '2025-03-20',
      completed: false,
    },
    {
      id: '2',
      text: 'Practice scales for 30 minutes daily',
      dueDate: '2025-03-15',
      completed: true,
    },
  ]);
  const [newGoal, setNewGoal] = useState('');
  const [dueDate, setDueDate] = useState('');

  const addGoal = () => {
    if (newGoal.trim() && dueDate) {
      setGoals([
        ...goals,
        {
          id: Date.now().toString(),
          text: newGoal.trim(),
          dueDate,
          completed: false,
        },
      ]);
      setNewGoal('');
      setDueDate('');
    }
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  return (
    <Card className="p-4">
      <h2 className="mb-4 font-semibold">Goals</h2>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Add a new goal..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
        />
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-40"
        />
        <Button onClick={addGoal} disabled={!newGoal.trim() || !dueDate}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`flex items-start gap-3 rounded-lg border p-3 ${
              goal.completed ? 'bg-muted/50' : ''
            }`}
          >
            <button
              onClick={() => toggleGoal(goal.id)}
              className="mt-1 text-muted-foreground transition-colors hover:text-primary"
            >
              {goal.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
            <div className="flex-1">
              <p className={goal.completed ? 'line-through' : ''}>
                {goal.text}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(goal.dueDate).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}