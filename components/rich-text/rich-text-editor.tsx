"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Undo,
  Redo,
  Eye,
  EyeOff,
  VolumeX,
  Volume2,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  onSave?: (html: string) => Promise<void>;
  autoSave?: boolean;
  readabilityScore?: boolean;
  adhd?: boolean;
  className?: string;
  toolbar?: "full" | "minimal" | "none";
}

export function RichTextEditor({
  initialContent = "",
  placeholder = "Start writing...",
  onChange,
  onSave,
  autoSave = true,
  readabilityScore = true,
  adhd = false,
  className = "",
  toolbar = "full",
}: RichTextEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [textToSpeechActive, setTextToSpeechActive] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readability, setReadability] = useState<{
    score: number;
    grade: string;
  } | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "text-blue-600 underline",
        },
      }),
      Image,
      TextStyle,
      Color,
      Highlight.configure({
        HTMLAttributes: {
          class: "bg-yellow-200 text-black",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "task-list",
        },
      }),
    ],
    content: initialContent,
    autofocus: "end",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();

      if (onChange) {
        onChange(html);
      }

      // Calculate word count
      const text = editor.getText();
      setWordCount(text.split(/\s+/).filter(Boolean).length);

      // Calculate readability if enabled
      if (readabilityScore) {
        calculateReadability(text);
      }

      // Setup auto-save
      if (autoSave && onSave) {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
          handleSave();
        }, 30000); // 30 seconds auto-save
      }
    },
  });

  useEffect(() => {
    // Set initial content when editor is ready
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }

    // Calculate initial word count
    if (editor) {
      setWordCount(editor.getText().split(/\s+/).filter(Boolean).length);
      if (readabilityScore) {
        calculateReadability(editor.getText());
      }
    }

    // Cleanup auto-save timer
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Stop text-to-speech if active
      if (textToSpeechActive && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [editor, initialContent, readabilityScore]);

  // Calculate readability using Flesch-Kincaid
  const calculateReadability = (text: string) => {
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const syllables = countSyllables(text);

    if (words === 0 || sentences === 0) {
      setReadability(null);
      return;
    }

    // Flesch-Kincaid Grade Level formula
    const gradeLevel =
      0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
    const score = Math.round(gradeLevel * 10) / 10;

    let grade = "College";
    if (score < 6) grade = "Elementary";
    else if (score < 8) grade = "Middle School";
    else if (score < 12) grade = "High School";
    else if (score < 14) grade = "College";
    else grade = "Graduate";

    setReadability({ score, grade });
  };

  // Simple syllable counter (not perfect but gives an estimate)
  const countSyllables = (text: string) => {
    text = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const words = text.split(/\s+/);
    let syllableCount = 0;

    for (const word of words) {
      if (!word) continue;

      // Count vowel groups
      let count = word.match(/[aeiouy]{1,2}/g)?.length || 0;

      // Adjust for common patterns
      if (word.endsWith("e") && !word.endsWith("le")) {
        count--;
      }

      // Every word has at least one syllable
      syllableCount += Math.max(1, count);
    }

    return syllableCount;
  };

  // Handle manual save
  const handleSave = async () => {
    if (!editor || !onSave) return;

    setIsSaving(true);
    try {
      await onSave(editor.getHTML());
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle focus mode
  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  // Toggle text-to-speech
  const toggleTextToSpeech = () => {
    if (!window.speechSynthesis) return;

    if (textToSpeechActive) {
      window.speechSynthesis.cancel();
      setTextToSpeechActive(false);
      return;
    }

    if (!editor) return;

    const text = editor.getText();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower rate

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setTextToSpeechActive(true);

    utterance.onend = () => {
      setTextToSpeechActive(false);
      speechSynthesisRef.current = null;
    };
  };

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return null;

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(lastSaved);
  };

  if (!editor) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-md border",
        focusMode && "bg-slate-50 dark:bg-slate-900",
        className
      )}
    >
      {toolbar !== "none" && (
        <div
          className={cn(
            "flex flex-wrap gap-1 border-b p-2",
            focusMode && "opacity-10 hover:opacity-100 transition-opacity"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn("h-8 w-8", editor.isActive("bold") && "bg-muted")}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn("h-8 w-8", editor.isActive("italic") && "bg-muted")}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("underline") && "bg-muted"
            )}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>

          {toolbar === "full" && (
            <>
              <Separator orientation="vertical" className="mx-1 h-8" />

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={cn(
                  "h-8 w-8",
                  editor.isActive("heading", { level: 1 }) && "bg-muted"
                )}
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={cn(
                  "h-8 w-8",
                  editor.isActive("heading", { level: 2 }) && "bg-muted"
                )}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={cn(
                  "h-8 w-8",
                  editor.isActive("heading", { level: 3 }) && "bg-muted"
                )}
                title="Heading 3"
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </>
          )}

          <Separator orientation="vertical" className="mx-1 h-8" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("bulletList") && "bg-muted"
            )}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(
              "h-8 w-8",
              editor.isActive("orderedList") && "bg-muted"
            )}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          {toolbar === "full" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(
                  "h-8 w-8",
                  editor.isActive("blockquote") && "bg-muted"
                )}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn(
                  "h-8 w-8",
                  editor.isActive("codeBlock") && "bg-muted"
                )}
                title="Code Block"
              >
                <Code className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="mx-1 h-8" />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const url = window.prompt("Enter the URL");
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={cn("h-8 w-8", editor.isActive("link") && "bg-muted")}
                title="Add Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const url = window.prompt("Enter the image URL");
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                }}
                className="h-8 w-8"
                title="Add Image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </>
          )}

          <Separator orientation="vertical" className="mx-1 h-8" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>

          {adhd && (
            <>
              <div className="flex-1" />

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFocusMode}
                className="h-8 w-8"
                title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
              >
                {focusMode ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTextToSpeech}
                className={cn("h-8 w-8", textToSpeechActive && "bg-muted")}
                title={textToSpeechActive ? "Stop Reading" : "Read Aloud"}
              >
                {textToSpeechActive ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </>
          )}

          {onSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="ml-auto h-8 gap-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-3 w-3" />
                  <span>Save</span>
                </>
              )}
            </Button>
          )}
        </div>
      )}

      <div
        className={cn(
          "flex-1 overflow-y-auto p-4",
          focusMode && "bg-slate-50 dark:bg-slate-900"
        )}
      >
        <EditorContent
          editor={editor}
          className={cn(
            "prose max-w-none dark:prose-invert prose-headings:mb-3 prose-headings:mt-4 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-blockquote:my-2 min-h-[200px]",
            focusMode && "prose-lg max-w-2xl mx-auto"
          )}
        />
      </div>

      {(readabilityScore || autoSave) && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 border-t p-2 text-xs text-muted-foreground",
            focusMode && "opacity-10 hover:opacity-100 transition-opacity"
          )}
        >
          <div>Words: {wordCount}</div>

          {readability && (
            <div className="flex items-center gap-1">
              <span>Reading level:</span>
              <Badge variant="secondary" className="text-xs">
                {readability.grade}
              </Badge>
            </div>
          )}

          {lastSaved && (
            <div className="ml-auto flex items-center gap-1">
              <Save className="h-3 w-3" />
              <span>Last saved at {formatLastSaved()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
