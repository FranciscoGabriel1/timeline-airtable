import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TimelineItem } from '../../types';

type CommitPayload = {
  id: string | number;
  startDay: number;
  endDay: number;
  name?: string;
};

type TimelineItemProps = {
  item: TimelineItem;
  minDay: number;
  pixelsPerDay: number;
  laneHeight: number;
  onCommit: (next: CommitPayload) => void;
};

const HANDLE_W = 6; // px

export default function TimelineItem({
  item,
  minDay,
  pixelsPerDay,
  laneHeight,
  onCommit,
}: TimelineItemProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragDraft, setDragDraft] = useState<{ start: number; end: number } | null>(null);
  const [mode, setMode] = useState<'idle' | 'move' | 'resize-left' | 'resize-right'>('idle');
  const [isEditing, setIsEditing] = useState(false);

  const start = dragDraft ? dragDraft.start : item.__start!;
  const end = dragDraft ? dragDraft.end : item.__end!;

  const left = ((start - minDay) + 2) * pixelsPerDay;
  const width = Math.max(pixelsPerDay * (end - start + 1), 14);
  const height = laneHeight - 8;
  const top = (item.lane ?? 0) * laneHeight + 32 + 4;

  // Mouse handlers for drag/resize
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing) return; // ignore when editing
    const rect = ref.current!.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    let nextMode: 'move' | 'resize-left' | 'resize-right' = 'move';
    if (offsetX <= HANDLE_W) nextMode = 'resize-left';
    else if (offsetX >= rect.width - HANDLE_W) nextMode = 'resize-right';

    setMode(nextMode);

    const startMouseX = e.clientX;
    const baseStart = start;
    const baseEnd = end;

    const onMove = (ev: MouseEvent) => {
      const dxPx = ev.clientX - startMouseX;
      const dxDays = Math.round(dxPx / pixelsPerDay);

      if (nextMode === 'move') {
        setDragDraft({ start: baseStart + dxDays, end: baseEnd + dxDays });
      } else if (nextMode === 'resize-left') {
        const nextStart = Math.min(baseStart + dxDays, baseEnd);
        setDragDraft({ start: nextStart, end: baseEnd });
      } else if (nextMode === 'resize-right') {
        const nextEnd = Math.max(baseEnd + dxDays, baseStart);
        setDragDraft({ start: baseStart, end: nextEnd });
      }
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      setMode('idle');
      if (dragDraft) {
        onCommit({ id: item.id, startDay: dragDraft.start, endDay: dragDraft.end });
      }
      setDragDraft(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [dragDraft, end, isEditing, item.id, onCommit, pixelsPerDay, start]);

  // Keyboard: allow ±1 day when focused
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isEditing) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const delta = e.key === 'ArrowLeft' ? -1 : 1;
      const next = { start: start + delta, end: end + delta };
      setDragDraft(next);
      onCommit({ id: item.id, startDay: next.start, endDay: next.end });
      setDragDraft(null);
    } else if (e.key === 'Enter') {
      setIsEditing(true);
    }
  }, [end, isEditing, item.id, onCommit, start]);

  // Inline editing with blur/Enter/Escape
  const onEditBlur = useCallback((e: React.FocusEvent<HTMLSpanElement>) => {
    const value = e.currentTarget.textContent?.trim();
    if (value && value !== item.name) {
      onCommit({ id: item.id, startDay: start, endDay: end, name: value });
    }
    setIsEditing(false);
  }, [end, item.id, item.name, onCommit, start]);

  useEffect(() => {
    if (!isEditing) return;
    const el = ref.current?.querySelector('.inlineEdit') as HTMLSpanElement | null;
    el?.focus();
  }, [isEditing]);

  return (
    <div
      ref={ref}
      className={`item ${mode !== 'idle' ? 'isDragging' : ''}`}
      style={{ left, top, width, height }}
      title={`${item.name} (${item.startDate} – ${item.endDate})`}
      role="button"
      tabIndex={0}
      aria-label={`${item.name}: ${item.startDate} to ${item.endDate}`}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
      onDoubleClick={() => setIsEditing(true)}
    >
      {/* resize handles */}
      <div className="itemHandle itemHandle--left" />
      <div className="itemLabelWrap">
        {isEditing ? (
          <span
            className="inlineEdit"
            contentEditable
            suppressContentEditableWarning
            onBlur={onEditBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') setIsEditing(false);
            }}
          >
            {item.name}
          </span>
        ) : (
          <span className="itemLabel">{item.name}</span>
        )}
      </div>
      <div className="itemHandle itemHandle--right" />
    </div>
  );
}
