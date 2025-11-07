import '@testing-library/jest-dom';
import { vi } from 'vitest';

// react-dnd 모킹
vi.mock('react-dnd', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => children,
  useDrag: () => [{ isDragging: false }, null, null],
  useDrop: () => [{ isOver: false }, null],
}));

vi.mock('react-dnd-html5-backend', () => ({
  HTML5Backend: {},
}));

// sonner toast 모킹
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

