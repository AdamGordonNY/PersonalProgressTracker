"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, X, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface FileScanResult {
  provider: string;
  filesFound: number;
  status: 'scanning' | 'complete';
}

interface FileFinder {
  onClose: () => void;
}

export function FileFinder({ onClose }: FileFinder) {
  const [scanResults, setScanResults] = useState<Record<string, FileScanResult>>({
    GoogleDrive: { provider: 'Google Drive', filesFound: 0, status: 'scanning' },
    OneDrive: { provider: 'OneDrive', filesFound: 0, status: 'scanning' },
  });
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate scanning process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });

      // Simulate finding files
      setScanResults(prev => {
        if (progress < 50) {
          return {
            ...prev,
            GoogleDrive: {
              ...prev.GoogleDrive,
              filesFound: Math.floor(Math.random() * 5) + prev.GoogleDrive.filesFound,
            },
          };
        } else if (progress < 100) {
          return {
            ...prev,
            OneDrive: {
              ...prev.OneDrive,
              filesFound: Math.floor(Math.random() * 3) + prev.OneDrive.filesFound,
            },
          };
        } else {
          return {
            GoogleDrive: { ...prev.GoogleDrive, status: 'complete' },
            OneDrive: { ...prev.OneDrive, status: 'complete' },
          };
        }
      });
    }, 100);

    return () => clearInterval(interval);
  }, [progress]);

  const handleImport = () => {
    toast({
      title: "Files Imported",
      description: `${scanResults.GoogleDrive.filesFound + scanResults.OneDrive.filesFound} files have been added to your Knowledge Vault.`,
    });
    onClose();
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
            <h2 className="text-2xl font-bold">Finding Your Files</h2>
            <p className="text-muted-foreground">
              Scanning your cloud storage for documents...
            </p>
          </div>

          <Progress value={progress} className="mb-6" />

          <div className="space-y-4">
            {Object.entries(scanResults).map(([key, result]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{result.provider}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.filesFound} files found
                    </p>
                  </div>
                </div>
                {result.status === 'scanning' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <Check className="h-5 w-5 text-green-500" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={progress < 100}
              className="gap-2"
            >
              {progress < 100 ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                'Import Files'
              )}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}