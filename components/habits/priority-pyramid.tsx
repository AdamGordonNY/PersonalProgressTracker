"use client";

import { Card } from '@/components/ui/card';

export function PriorityPyramid() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Priority Pyramid</h2>
      <Card className="overflow-hidden">
        <div className="space-y-4 p-4">
          <div className="relative">
            <div className="mx-auto w-0 border-l-[100px] border-r-[100px] border-t-[100px] border-l-transparent border-r-transparent border-t-red-500/20" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-red-700 dark:text-red-300">
              Critical
            </div>
          </div>
          
          <div className="relative -mt-4">
            <div className="mx-auto w-0 border-l-[150px] border-r-[150px] border-t-[100px] border-l-transparent border-r-transparent border-t-amber-500/20" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-amber-700 dark:text-amber-300">
              Important
            </div>
          </div>
          
          <div className="relative -mt-4">
            <div className="mx-auto w-0 border-l-[200px] border-r-[200px] border-t-[100px] border-l-transparent border-r-transparent border-t-emerald-500/20" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Optional
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}