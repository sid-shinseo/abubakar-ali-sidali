import type { ReactNode } from 'react';
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface SortableTableBodyProps<T extends { id: string }> {
  items: T[];
  /** Receives the ids in their new order. */
  onReorder: (orderedIds: string[]) => void;
  /** Cells of a row (the drag handle cell is added in front). */
  renderCells: (item: T) => ReactNode;
  onRowClick?: (item: T) => void;
  /** Turns dragging off, e.g. while the list is filtered. The handle column stays for alignment. */
  disabled?: boolean;
}

/** Table body whose rows can be reordered with the mouse, touch, or keyboard (space, arrows, space). */
export function SortableTableBody<T extends { id: string }>({ items, onReorder, renderCells, onRowClick, disabled }: SortableTableBodyProps<T>) {
  const sensors = useSensors(
    // A few pixels of movement before dragging, so clicks on the handle still work.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = items.map((item) => item.id);
    onReorder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy} disabled={disabled}>
        <TableBody>
          {items.map((item) => (
            <SortableRow key={item.id} id={item.id} disabled={disabled} onClick={onRowClick ? () => onRowClick(item) : undefined}>
              {renderCells(item)}
            </SortableRow>
          ))}
        </TableBody>
      </SortableContext>
    </DndContext>
  );
}

interface SortableRowProps {
  id: string;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

function SortableRow({ id, disabled, onClick, children }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(onClick && 'cursor-pointer', isDragging && 'relative z-10 bg-accent shadow-card-hover')}
      onClick={onClick}
    >
      <TableCell className="w-8 pr-0 pl-2" onClick={(e) => e.stopPropagation()}>
        {!disabled && (
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label="Déplacer"
            className="flex size-7 cursor-grab touch-none items-center justify-center rounded text-muted-foreground/60 hover:bg-accent hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
        )}
      </TableCell>
      {children}
    </TableRow>
  );
}
