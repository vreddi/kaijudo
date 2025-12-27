import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardProps } from "./Card";
import { cn } from "./utils";

export interface DraggableCardProps extends CardProps {
  /**
   * Unique identifier for this draggable card
   */
  id: string;
  /**
   * Data to pass when card is dragged
   */
  data?: Record<string, unknown>;
  /**
   * Whether the card is currently being dragged
   */
  isDragging?: boolean;
}

/**
 * Draggable wrapper for Card component
 * Uses @dnd-kit for drag and drop functionality
 *
 * @example
 * ```tsx
 * <DndContext onDragEnd={handleDragEnd}>
 *   <DraggableCard
 *     id="card-1"
 *     imageSrc="/creature.png"
 *     size={CardSize.Hand}
 *   />
 * </DndContext>
 * ```
 */
export function DraggableCard({
  id,
  data,
  isDragging: externalIsDragging,
  className,
  ...cardProps
}: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: internalIsDragging,
  } = useDraggable({
    id,
    data,
  });

  const isDragging = externalIsDragging ?? internalIsDragging;
  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "z-50 opacity-90"
      )}
      {...listeners}
      {...attributes}
    >
      <Card
        {...cardProps}
        className={cn(
          className,
          isDragging && "shadow-2xl scale-105 rotate-2"
        )}
      />
    </div>
  );
}

