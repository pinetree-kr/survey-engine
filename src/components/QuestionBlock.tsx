import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, Trash2, Copy } from 'lucide-react';
import { Question } from '@/schema/question.types';
import { QuestionPreview } from './QuestionPreview';
import { useRef } from 'react';

interface QuestionBlockProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export function QuestionBlock({
  question,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
}: QuestionBlockProps) {
  const ref = useRef<HTMLDivElement>(null);

  // const [{ handlerId }, drop] = useDrop({
  //   accept: 'question',
  //   collect(monitor) {
  //     return {
  //       handlerId: monitor.getHandlerId(),
  //     };
  //   },
  //   hover(item: DragItem, monitor) {
  //     if (!ref.current) {
  //       return;
  //     }
  //     const dragIndex = item.index;
  //     const hoverIndex = index;

  //     if (dragIndex === hoverIndex) {
  //       return;
  //     }

  //     const hoverBoundingRect = ref.current?.getBoundingClientRect();
  //     const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
  //     const clientOffset = monitor.getClientOffset();
  //     const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

  //     if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
  //       return;
  //     }

  //     if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
  //       return;
  //     }

  //     onMove(dragIndex, hoverIndex);
  //     item.index = hoverIndex;
  //   },
  // });
  const [collectedProps, drop] = useDrop({
    accept: 'question',
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

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'question',
    item: () => {
      return { id: question.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={collectedProps.handlerId}
      className={`
        relative group bg-white rounded-2xl border-2 p-6 transition-all duration-200
        ${isSelected ? 'border-indigo-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      onClick={onSelect}
    >
      {/* Drag handle */}
      <div
        ref={(el) => {
          if (el) {
            drag(el);
          }
        }}
        className="absolute left-2 top-6 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>

      {/* Question number */}
      <div className="absolute -left-3 -top-3 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center">
        {index + 1}
      </div>

      {/* Action buttons */}
      <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            // e.stopPropagation();
            onDuplicate();
          }}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Copy className="w-4 h-4 text-gray-500" />
        </button>
        <button
          onClick={(e) => {
            // e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>

      {/* Question content */}
      <div className="space-y-4 pl-8">
        <div className="flex items-start">
          {question.required && (
            <span className="text-red-500 mr-1">*</span>
          )}
          <input
            type="text"
            value={question.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="질문을 입력하세요..."
            className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400"
          // onClick={(e) => e.stopPropagation()}
          />
        </div>

        {question.description !== undefined && (
          <input
            type="text"
            value={question.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="설명 추가 (선택사항)"
            className="w-full bg-transparent border-none outline-none text-gray-600 placeholder-gray-400"
          // onClick={(e) => e.stopPropagation()}
          />
        )}

        <QuestionPreview question={question} onUpdate={onUpdate} />
      </div>
    </div>
  );
}
