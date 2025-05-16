"use client";

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const mockData = {
  scores: [
    { round: 1, score: 85 },
    { round: 2, score: 82 },
    { round: 3, score: 88 },
    { round: 4, score: 81 },
    { round: 5, score: 83 },
  ],
  putts: [
    { round: 1, putts: 36 },
    { round: 2, putts: 34 },
    { round: 3, putts: 35 },
    { round: 4, putts: 32 },
    { round: 5, putts: 33 },
  ],
  fairways: [
    { round: 1, percentage: 66 },
    { round: 2, percentage: 55 },
    { round: 3, percentage: 77 },
    { round: 4, percentage: 66 },
    { round: 5, percentage: 88 },
  ],
};

export function StatsDashboard() {
  return (
    <Card className="p-6">
      <Tabs defaultValue="scores" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="putts">Putting</TabsTrigger>
          <TabsTrigger value="fairways">Fairways</TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-4">
          <div className="rounded-lg border bg-emerald-50 p-4 dark:bg-emerald-950">
            <h3 className="mb-2 font-semibold">Score Trends</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.scores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="round" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#059669"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="putts" className="space-y-4">
          <div className="rounded-lg border bg-emerald-50 p-4 dark:bg-emerald-950">
            <h3 className="mb-2 font-semibold">Putting Performance</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.putts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="round" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="putts"
                    stroke="#059669"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fairways" className="space-y-4">
          <div className="rounded-lg border bg-emerald-50 p-4 dark:bg-emerald-950">
            <h3 className="mb-2 font-semibold">Fairways Hit (%)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.fairways}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="round" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#059669"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}