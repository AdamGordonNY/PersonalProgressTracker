"use client";

import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface HoleData {
  par: number;
  strokes: number;
  putts: number;
  fairwayHit: boolean;
}

export function Scorecard() {
  const [courseName, setCourseName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [holes, setHoles] = useState<HoleData[]>([
    { par: 4, strokes: 0, putts: 0, fairwayHit: false },
    { par: 4, strokes: 0, putts: 0, fairwayHit: false },
    { par: 3, strokes: 0, putts: 0, fairwayHit: false },
    { par: 5, strokes: 0, putts: 0, fairwayHit: false },
    { par: 4, strokes: 0, putts: 0, fairwayHit: false },
    { par: 4, strokes: 0, putts: 0, fairwayHit: false },
    { par: 3, strokes: 0, putts: 0, fairwayHit: false },
    { par: 5, strokes: 0, putts: 0, fairwayHit: false },
    { par: 4, strokes: 0, putts: 0, fairwayHit: false },
  ]);
  const { toast } = useToast();

  const updateHole = (index: number, field: keyof HoleData, value: number | boolean) => {
    const newHoles = [...holes];
    newHoles[index] = { ...newHoles[index], [field]: value };
    setHoles(newHoles);
  };

  const getTotalScore = () => holes.reduce((sum, hole) => sum + hole.strokes, 0);
  const getTotalPar = () => holes.reduce((sum, hole) => sum + hole.par, 0);
  const getTotalPutts = () => holes.reduce((sum, hole) => sum + hole.putts, 0);
  const getFairwaysHit = () => holes.filter(hole => hole.fairwayHit).length;

  const handleSave = () => {
    // Save round data
    toast({
      title: "Round Saved",
      description: `${courseName} - ${new Date(date).toLocaleDateString()}`,
    });
  };

  return (
    <Card className="p-6">
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="courseName">Course Name</Label>
          <Input
            id="courseName"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Enter course name"
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr className="border-b text-sm">
              <th className="p-2 text-left">Hole</th>
              <th className="p-2 text-left">Par</th>
              <th className="p-2 text-left">Strokes</th>
              <th className="p-2 text-left">Putts</th>
              <th className="p-2 text-left">Fairway Hit</th>
            </tr>
          </thead>
          <tbody>
            {holes.map((hole, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">
                  <Input
                    type="number"
                    min="3"
                    max="5"
                    value={hole.par}
                    onChange={(e) => updateHole(index, 'par', parseInt(e.target.value))}
                    className="w-20"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    min="1"
                    value={hole.strokes}
                    onChange={(e) => updateHole(index, 'strokes', parseInt(e.target.value))}
                    className="w-20"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    min="0"
                    value={hole.putts}
                    onChange={(e) => updateHole(index, 'putts', parseInt(e.target.value))}
                    className="w-20"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={hole.fairwayHit}
                    onChange={(e) => updateHole(index, 'fairwayHit', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950">
          <div className="text-sm text-muted-foreground">Total Score</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {getTotalScore()}
          </div>
        </div>
        <div className="rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950">
          <div className="text-sm text-muted-foreground">vs Par</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {getTotalScore() - getTotalPar()}
          </div>
        </div>
        <div className="rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950">
          <div className="text-sm text-muted-foreground">Total Putts</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {getTotalPutts()}
          </div>
        </div>
        <div className="rounded-lg border bg-emerald-50 p-3 dark:bg-emerald-950">
          <div className="text-sm text-muted-foreground">Fairways Hit</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {getFairwaysHit()}/9
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setHoles(holes.map(hole => ({ ...hole, strokes: 0, putts: 0, fairwayHit: false })))}>
          Clear
        </Button>
        <Button onClick={handleSave} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Save className="h-4 w-4" />
          Save Round
        </Button>
      </div>
    </Card>
  );
}