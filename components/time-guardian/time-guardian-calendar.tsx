"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';

interface TimeBlock {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface TimeGuardianCalendarProps {
  onClose: () => void;
}

export function TimeGuardianCalendar({ onClose }: TimeGuardianCalendarProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);

  // Mock data - replace with actual Google Calendar integration
  useEffect(() => {
    const mockTimeBlocks: TimeBlock[] = [
      {
        id: '1',
        title: 'Focus Session',
        start: new Date(2025, 2, 15, 9, 0),
        end: new Date(2025, 2, 15, 10, 30),
      },
      {
        id: '2',
        title: 'Deep Work',
        start: new Date(2025, 2, 15, 14, 0),
        end: new Date(2025, 2, 15, 16, 0),
      },
    ];
    setTimeBlocks(mockTimeBlocks);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-[calc(4rem+80px)] right-4 z-50"
    >
      <Card className="w-80 shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            <h3 className="font-semibold">Schedule</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="rounded-md border"
          />
          <div className="mt-4 space-y-2">
            {timeBlocks.map((block) => (
              <div
                key={block.id}
                className="rounded-md border bg-muted p-2 text-sm"
              >
                <div className="font-medium">{block.title}</div>
                <div className="text-muted-foreground">
                  {format(block.start, 'HH:mm')} - {format(block.end, 'HH:mm')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}