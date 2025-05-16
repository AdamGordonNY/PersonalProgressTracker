"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, X, Save, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface RecordingStudioProps {
  onClose: () => void;
}

export function RecordingStudio({ onClose }: RecordingStudioProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const { toast } = useToast();

  const startRecording = () => {
    setIsRecording(true);
    // Here you would implement actual audio recording
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate saving a recording
    setRecordings([...recordings, `Recording ${recordings.length + 1}`]);
    toast({
      title: "Recording Saved",
      description: "Your practice session has been recorded.",
    });
  };

  const togglePlayback = (recording: string) => {
    if (isPlaying === recording) {
      setIsPlaying(null);
    } else {
      setIsPlaying(recording);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="relative w-full max-w-lg"
      >
        <Card className="p-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold">Recording Studio</h2>
            <p className="text-muted-foreground">
              Record and playback your practice sessions
            </p>
          </div>

          <div className="mb-6 flex justify-center">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className="gap-2"
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" /> Start Recording
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            {recordings.map((recording) => (
              <div
                key={recording}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{recording}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePlayback(recording)}
                  >
                    {isPlaying === recording ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}