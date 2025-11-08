'use client';

import { useDrop } from 'react-dnd';
import { useRef } from 'react';

interface SectionDropZoneProps {
  sectionId: string;
  onDrop: (questionId: string, targetSectionId: string, targetIndex?: number) => void;
  isEmpty?: boolean;
  targetIndex?: number; // 드롭 존의 타겟 인덱스 (문항 사이에 삽입할 위치)
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export function SectionDropZone({ sectionId, onDrop, isEmpty = false, targetIndex }: SectionDropZoneProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId, isOver }, drop] = useDrop({
    accept: 'question',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver(),
      };
    },
    drop(item: DragItem) {
      if (item && item.id) {
        onDrop(item.id, sectionId, targetIndex);
      }
    },
  });

  drop(ref);

  if (isEmpty) {
    return (
      <div
        ref={ref}
        data-handler-id={handlerId}
        className={`
          relative my-6 min-h-[60px] rounded-xl border-2 border-dashed transition-all duration-200
          ${isOver 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }
        `}
      >
        {isOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 bg-indigo-400" />
              <div className="h-4 w-4 rounded-full bg-indigo-500 border-2 border-white shadow-lg" />
              <div className="flex-1 h-1 bg-indigo-400" />
            </div>
          </div>
        )}
        {!isOver && (
          <div className="text-center py-8 text-gray-400">
            <p>이 섹션에는 아직 문항이 없습니다</p>
            <p className="text-sm mt-1">문항을 여기로 드래그하거나 섹션 헤더의 "문항 추가" 버튼을 클릭하세요</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className="relative my-3 flex items-center justify-center h-4 min-h-[16px]"
    >
      <div className="flex items-center gap-3 w-full px-4">
        {isOver ? (
          <>
            <div className="flex-1 h-1 bg-indigo-400" />
            <div className="h-4 w-4 rounded-full bg-indigo-500 border-2 border-white shadow-lg flex-shrink-0" />
            <div className="flex-1 h-1 bg-indigo-400" />
          </>
        ) : (
          <>
            <div className="flex-1 h-1 bg-transparent" />
            <div className="h-4 w-4 bg-transparent flex-shrink-0" />
            <div className="flex-1 h-1 bg-transparent" />
          </>
        )}
      </div>
    </div>
  );
}

