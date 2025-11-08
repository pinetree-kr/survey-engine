'use client';

import { useDrop } from 'react-dnd';
import { useRef } from 'react';
import { Plus } from 'lucide-react';

interface SectionDropZoneProps {
  sectionId: string;
  onDrop: (questionId: string, targetSectionId: string, targetIndex?: number) => void;
  onAddQuestion?: (sectionId: string, targetIndex?: number) => void;
  isEmpty?: boolean;
  targetIndex?: number; // 드롭 존의 타겟 인덱스 (문항 사이에 삽입할 위치)
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export function SectionDropZone({ sectionId, onDrop, onAddQuestion, isEmpty = false, targetIndex }: SectionDropZoneProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (onAddQuestion) {
      onAddQuestion(sectionId, targetIndex);
    }
  };

  const [collectedProps, drop] = useDrop({
    accept: 'question',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver(),
      };
    },
    drop(item: any) {
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
        data-handler-id={collectedProps.handlerId}
        className={`
          relative my-6 min-h-[60px] rounded-xl border-2 border-dashed transition-all duration-200
          ${onAddQuestion ? 'cursor-pointer' : ''}
          ${collectedProps.isOver
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }
        `}
        onClick={handleClick}
      >
        {collectedProps.isOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1 bg-indigo-400" />
              <div className="h-4 w-4 rounded-full bg-indigo-500 border-2 border-white shadow-lg" />
              <div className="flex-1 h-1 bg-indigo-400" />
            </div>
          </div>
        )}
        {!collectedProps.isOver && (
          <div className="text-center py-8 text-gray-400">
            {onAddQuestion && (
              <div className="flex items-center justify-center mb-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 hover:bg-indigo-400 text-gray-500 hover:text-white transition-all flex items-center justify-center cursor-pointer opacity-40 hover:opacity-100">
                  <Plus className="h-5 w-5" />
                </div>
              </div>
            )}
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
      data-handler-id={collectedProps.handlerId}
      className={`relative my-3 flex items-center justify-center h-4 min-h-[16px] group transition-all duration-200 ${onAddQuestion ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 w-full px-4">
        {collectedProps.isOver ? (
          <>
            <div className="flex-1 h-1 bg-indigo-400" />
            <div className="h-4 w-4 rounded-full bg-indigo-500 border-2 border-white shadow-lg flex-shrink-0" />
            <div className="flex-1 h-1 bg-indigo-400" />
          </>
        ) : (
          <>
            <div className={`flex-1 h-1 transition-colors ${onAddQuestion ? 'group-hover:bg-indigo-200' : 'bg-transparent'}`} />
            {onAddQuestion && (
              <div className="h-6 w-6 rounded-full bg-gray-200 group-hover:bg-indigo-400 text-gray-500 group-hover:text-white transition-all flex-shrink-0 opacity-30 group-hover:opacity-100 flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
            )}
            {!onAddQuestion && (
              <div className="h-4 w-4 bg-transparent flex-shrink-0" />
            )}
            <div className={`flex-1 h-1 transition-colors ${onAddQuestion ? 'group-hover:bg-indigo-200' : 'bg-transparent'}`} />
          </>
        )}
      </div>
    </div>
  );
}

