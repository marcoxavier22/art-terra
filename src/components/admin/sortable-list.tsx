'use client';
import * as React from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SortControls {
  /** Drag handle + up/down buttons (the buttons are what phones use). */
  handle: React.ReactNode;
}

function Row<T>({
  id,
  item,
  index,
  total,
  disabled,
  label,
  move,
  render,
  className,
}: {
  id: string;
  item: T;
  index: number;
  total: number;
  disabled: boolean;
  label: string;
  move: (from: number, to: number) => void;
  render: (item: T, controls: SortControls, index: number) => React.ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });
  const btn =
    'grid size-9 place-items-center rounded-md text-muted hover:bg-sand hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent';
  const handle = (
    <div className={cn('flex shrink-0 items-center', disabled && 'invisible')}>
      <button
        type="button"
        aria-label={`Arrastar para reordenar: ${label}`}
        className={cn(btn, 'hidden cursor-grab touch-none active:cursor-grabbing sm:grid')}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" aria-hidden />
      </button>
      <div className="flex flex-col sm:hidden">
        <button
          type="button"
          aria-label={`Subir: ${label}`}
          disabled={index === 0}
          onClick={() => move(index, index - 1)}
          className={btn}
        >
          <ArrowUp className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Descer: ${label}`}
          disabled={index === total - 1}
          onClick={() => move(index, index + 1)}
          className={btn}
        >
          <ArrowDown className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(className, isDragging && 'shadow-lift relative z-10 opacity-90')}
    >
      {render(item, { handle }, index)}
    </li>
  );
}

/**
 * Vertical drag-and-drop list (mouse, touch handle and keyboard) with up/down
 * buttons on phones. Calls `onReorder` with the full list in its new order.
 */
export function SortableList<T>({
  items,
  getId,
  getLabel,
  onReorder,
  renderItem,
  disabled = false,
  className,
  itemClassName,
}: {
  items: T[];
  getId: (item: T) => string;
  getLabel: (item: T) => string;
  onReorder: (items: T[]) => void;
  renderItem: (item: T, controls: SortControls, index: number) => React.ReactNode;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = items.map(getId);
  const dndId = React.useId();

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    onReorder(arrayMove(items, from, to));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    move(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
  }

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={className}>
          {items.map((item, index) => (
            <Row
              key={getId(item)}
              id={getId(item)}
              item={item}
              index={index}
              total={items.length}
              disabled={disabled}
              label={getLabel(item)}
              move={move}
              render={renderItem}
              className={itemClassName}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
