// components/notes/rich-text-preview.tsx
"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Loader2 } from "lucide-react";

interface RichTextPreviewProps {
  content: string;
  maxLength?: number;
}

export function RichTextPreview({ content, maxLength }: RichTextPreviewProps) {
  const [sanitizedContent, setSanitizedContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sanitize the content to prevent XSS attacks
    const clean = DOMPurify.sanitize(content);

    // Apply maxLength if specified
    let finalContent = clean;
    if (maxLength && clean.length > maxLength) {
      // Find the last space before maxLength
      const lastSpaceIndex = clean.lastIndexOf(" ", maxLength);
      finalContent =
        clean.substring(0, lastSpaceIndex > 0 ? lastSpaceIndex : maxLength) +
        "...";
    }

    setSanitizedContent(finalContent);
    setIsLoading(false);
  }, [content, maxLength]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
