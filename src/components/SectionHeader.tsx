'use client';

import { GripVertical, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Section } from '@/types/survey';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SectionHeaderProps {
  section: Section;
  index: number;
  questionCount: number;
  onUpdate: (id: string, updates: Partial<Section>) => void;
  onDelete: (id: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onAddQuestion: (sectionId: string) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export function SectionHeader({
  section,
  index,
  questionCount,
  onUpdate,
  onDelete,
  onMove,
  onAddQuestion,
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'section',
    item: () => {
      return { id: section.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [collectedProps, drop] = useDrop({
    accept: 'section',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      const dragItem = item as DragItem;
      if (!ref.current) {
        return;
      }
      const dragIndex = dragItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      dragItem.index = hoverIndex;
    },
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={collectedProps.handlerId}
      className={`
        relative group p-4 transition-all duration-200
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {/* Drag handle */}
      <div
        ref={(el) => {
          if (el) {
            drag(el);
          }
        }}
        className="absolute left-2 top-4 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-5 h-5 text-indigo-600" />
      </div>

      <div className="flex items-center gap-4 pl-8">
        <div className="flex-1">
          <Input
            value={section.title}
            onChange={(e) => onUpdate(section.id, { title: e.target.value })}
            placeholder="섹션 제목을 입력하세요..."
            className="bg-white border-indigo-200 focus:border-indigo-400 text-gray-900 font-semibold"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{questionCount}개 문항</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAddQuestion(section.id)}
            className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
          >
            <Plus className="w-4 h-4 mr-1" />
            문항 추가
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(section.id)}
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

