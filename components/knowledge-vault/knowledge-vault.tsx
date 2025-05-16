"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Book, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentViewer } from '@/components/knowledge-vault/document-viewer';
import { QuickReference } from '@/components/knowledge-vault/quick-reference';
import { FileFinder } from '@/components/knowledge-vault/file-finder';
import { useToast } from '@/hooks/use-toast';
import Fuse from 'fuse.js';

interface Document {
  id: string;
  title: string;
  provider: 'GoogleDrive' | 'OneDrive';
  type: 'pdf' | 'epub';
  url: string;
  content?: string;
}

export function KnowledgeVault() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showFileFinder, setShowFileFinder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize Fuse.js for searching
  const fuse = new Fuse(documents, {
    keys: ['title', 'content'],
    threshold: 0.3,
  });

  useEffect(() => {
    // Simulate loading documents
    const loadDocuments = async () => {
      // This would be replaced with actual API calls to Google Drive and OneDrive
      setTimeout(() => {
        setDocuments([
          {
            id: '1',
            title: 'Content Strategy Guide 2025',
            provider: 'GoogleDrive',
            type: 'pdf',
            url: 'https://example.com/doc1.pdf',
            content: 'Sample content for searching...',
          },
          {
            id: '2',
            title: 'Social Media Analytics',
            provider: 'OneDrive',
            type: 'pdf',
            url: 'https://example.com/doc2.pdf',
            content: 'More sample content...',
          },
        ]);
        setIsLoading(false);
      }, 1500);
    };

    loadDocuments();
  }, []);

  const filteredDocuments = searchQuery
    ? fuse.search(searchQuery).map(result => result.item)
    : documents;

  const handleScanForFiles = () => {
    setShowFileFinder(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Vault</h1>
          <p className="text-muted-foreground">
            Your centralized library for research and references
          </p>
        </div>
        <Button onClick={handleScanForFiles} className="gap-2">
          <Search className="h-4 w-4" />
          Where's My Stuff?
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search documents by keyword or phrase..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b p-4">
            <h2 className="font-semibold">Document Library</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredDocuments.length > 0 ? (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="rounded-lg border bg-background p-2">
                        <FileText className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{doc.title}</h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {doc.provider === 'GoogleDrive' ? (
                              <Book className="h-4 w-4" />
                            ) : (
                              <ExternalLink className="h-4 w-4" />
                            )}
                            {doc.provider}
                          </span>
                          <span>•</span>
                          <span>{doc.type.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
                  <h3 className="font-medium">No documents found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or adding new documents
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>

        <div className="space-y-6">
          <QuickReference />
        </div>
      </div>

      <AnimatePresence>
        {selectedDocument && (
          <DocumentViewer
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        )}
        {showFileFinder && (
          <FileFinder onClose={() => setShowFileFinder(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}