"use client";

import { useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Minimize2, Maximize2, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUIStore, WidgetPosition } from "@/lib/store";
import { cn } from "@/lib/utils";

interface FloatingWidgetProps {
  id: "focusFortress" | "timeGuardian" | "postureChecker";
  title: string;
  icon: ReactNode;
  children: ReactNode;
  onClose?: () => void;
  onSettings?: () => void;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function FloatingWidget({
  id,
  title,
  icon,
  children,
  onClose,
  onSettings,
  className,
  minWidth = 280,
  minHeight = 200,
  maxWidth = 500,
  maxHeight = 600,
}: FloatingWidgetProps) {
  const {
    [id]: widgetState,
    toggleMinimized,
    updatePosition,
    bringToFront,
  } = useUIStore();

  const constraintsRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `floating-widget-${id}`,
      data: {
        type: "floating-widget",
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: widgetState.zIndex,
  };

  // Handle position updates when dragging stops
  useEffect(() => {
    if (!isDragging && transform) {
      const newPosition: WidgetPosition = {
        x: widgetState.position.x + transform.x,
        y: widgetState.position.y + transform.y,
      };

      // Constrain to viewport
      const maxX =
        window.innerWidth -
        (widgetState.isMinimized ? 300 : widgetState.size.width);
      const maxY =
        window.innerHeight -
        (widgetState.isMinimized ? 100 : widgetState.size.height);

      newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
      newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));

      updatePosition(id, newPosition);
    }
  }, [
    isDragging,
    transform,
    id,
    updatePosition,
    widgetState.position,
    widgetState.size,
    widgetState.isMinimized,
  ]);

  // Bring widget to front when clicked
  const handleMouseDown = () => {
    bringToFront(id);
  };

  // Auto-position to avoid overlap on initial render
  useEffect(() => {
    const checkOverlap = () => {
      const widgets = document.querySelectorAll("[data-floating-widget]");
      const currentWidget = document.querySelector(
        `[data-floating-widget="${id}"]`
      );

      if (!currentWidget) return;

      const currentRect = currentWidget.getBoundingClientRect();
      let hasOverlap = false;

      widgets.forEach((widget) => {
        if (widget !== currentWidget) {
          const rect = widget.getBoundingClientRect();
          if (
            currentRect.left < rect.right &&
            currentRect.right > rect.left &&
            currentRect.top < rect.bottom &&
            currentRect.bottom > rect.top
          ) {
            hasOverlap = true;
          }
        }
      });

      if (hasOverlap) {
        // Find a non-overlapping position
        const offset = 30;
        const newPosition = {
          x: widgetState.position.x + offset,
          y: widgetState.position.y + offset,
        };

        // Ensure it stays within viewport
        const maxX = window.innerWidth - widgetState.size.width;
        const maxY = window.innerHeight - widgetState.size.height;

        if (newPosition.x > maxX || newPosition.y > maxY) {
          newPosition.x = 20;
          newPosition.y = 20;
        }

        updatePosition(id, newPosition);
      }
    };

    // Small delay to ensure DOM is ready
    const timeout = setTimeout(checkOverlap, 100);
    return () => clearTimeout(timeout);
  }, [id, updatePosition, widgetState.position, widgetState.size]);

  return (
    <div ref={constraintsRef} className="pointer-events-none fixed inset-0 z-0">
      <motion.div
        ref={setNodeRef}
        data-floating-widget={id}
        className="pointer-events-auto fixed"
        style={{
          left: widgetState.position.x,
          top: widgetState.position.y,
          minWidth,
          minHeight: widgetState.isMinimized ? "auto" : minHeight,
          maxWidth,
          maxHeight: widgetState.isMinimized ? "auto" : maxHeight,
          width: widgetState.size.width,
          height: widgetState.isMinimized ? "auto" : widgetState.size.height,
          ...style,
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onMouseDown={handleMouseDown}
      >
        <Card
          className={cn(
            "shadow-lg transition-shadow duration-200",
            isDragging && "shadow-2xl",
            className
          )}
        >
          {/* Header */}
          <div
            {...attributes}
            {...listeners}
            className="flex cursor-grab items-center justify-between border-b bg-card p-3 active:cursor-grabbing"
          >
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-semibold text-sm">{title}</h3>
            </div>

            <div className="flex items-center gap-1">
              {onSettings && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onSettings}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => toggleMinimized(id)}
              >
                {widgetState.isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>

              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {!widgetState.isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4">{children}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
