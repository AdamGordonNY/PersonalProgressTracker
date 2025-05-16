"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BookmarkPlus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  title: string;
  provider: 'GoogleDrive' | 'OneDrive';
  type: 'pdf' | 'epub';
  url: string;
  content?: string;
}

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [selectedText, setSelectedText] = useState('');
  const { toast } = useToast();

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  const handleSaveExcerpt = () => {
    if (selectedText) {
      // Save to Quick Reference database
      toast({
        title: "Excerpt Saved",
        description: "The selected text has been added to your Quick Reference.",
      });
      setSelectedText('');
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
        className="relative h-[90vh] w-[90vw] max-w-6xl"
      >
        <Card className="h-full">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-xl font-semibold">{document.title}</h2>
            <div className="flex items-center gap-2">
              {selectedText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveExcerpt}
                  className="gap-2"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  Save Excerpt
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div
            className="h-[calc(100%-5rem)] overflow-auto p-6"
            onMouseUp={handleTextSelection}
          >
            {/* This would be replaced with an actual PDF/EPUB viewer */}
            <div className="prose mx-auto max-w-4xl dark:prose-invert">
              <p>Document content would be displayed here using react-pdf or a similar library.</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}