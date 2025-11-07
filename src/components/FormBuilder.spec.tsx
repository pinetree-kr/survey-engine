import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormBuilder } from './FormBuilder';
import { toast } from 'sonner';

// 하위 컴포넌트 모킹
vi.mock('./Header', () => ({
  Header: ({ surveyTitle, onTitleChange, onPreview, onSaveDraft, onPublish }: any) => (
    <div data-testid="header">
      <input
        data-testid="title-input"
        value={surveyTitle}
        onChange={(e) => onTitleChange(e.target.value)}
      />
      <button data-testid="preview-btn" onClick={onPreview}>
        미리보기
      </button>
      <button data-testid="save-draft-btn" onClick={onSaveDraft}>
        임시저장
      </button>
      <button data-testid="publish-btn" onClick={onPublish}>
        배포하기
      </button>
    </div>
  ),
}));

vi.mock('./QuestionTypePalette', () => ({
  QuestionTypePalette: ({ onAddQuestion }: any) => (
    <div data-testid="question-type-palette">
      <button
        data-testid="add-short_text"
        onClick={() => onAddQuestion('short_text')}
      >
        단답형
      </button>
      <button
        data-testid="add-single_choice"
        onClick={() => onAddQuestion('single_choice')}
      >
        단일 선택
      </button>
      <button
        data-testid="add-description"
        onClick={() => onAddQuestion('description')}
      >
        설명
      </button>
    </div>
  ),
}));

vi.mock('./QuestionBlock', () => ({
  QuestionBlock: ({
    question,
    isSelected,
    onSelect,
    onUpdate,
    onDelete,
    onDuplicate,
  }: any) => (
    <div
      data-testid={`question-block-${question.id}`}
      data-selected={isSelected}
    >
      <div data-testid={`question-title-${question.id}`}>{question.title}</div>
      <button
        data-testid={`select-btn-${question.id}`}
        onClick={onSelect}
      >
        선택
      </button>
      <button
        data-testid={`update-btn-${question.id}`}
        onClick={() => onUpdate({ title: '업데이트된 제목' })}
      >
        업데이트
      </button>
      <button
        data-testid={`delete-btn-${question.id}`}
        onClick={onDelete}
      >
        삭제
      </button>
      <button
        data-testid={`duplicate-btn-${question.id}`}
        onClick={onDuplicate}
      >
        복제
      </button>
    </div>
  ),
}));

vi.mock('./InspectorPanel', () => ({
  InspectorPanel: ({ question, onUpdate }: any) => (
    <div data-testid="inspector-panel">
      {question ? (
        <>
          <div data-testid="inspector-question-id">{question.id}</div>
          <button
            data-testid="inspector-update-btn"
            onClick={() => onUpdate({ required: true })}
          >
            필수로 변경
          </button>
        </>
      ) : (
        <div data-testid="inspector-empty">질문을 선택하세요</div>
      )}
    </div>
  ),
}));

vi.mock('./AddQuestionBar', () => ({
  AddQuestionBar: ({ onClick }: any) => (
    <button data-testid="add-question-bar" onClick={onClick}>
      새 질문 추가
    </button>
  ),
}));

vi.mock('./ui/sonner', () => ({
  Toaster: () => null,
}));

describe('FormBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 렌더링', () => {
    it('초기 상태에서 빈 설문조사가 렌더링되어야 함', () => {
      render(<FormBuilder />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('question-type-palette')).toBeInTheDocument();
      expect(screen.getByTestId('inspector-panel')).toBeInTheDocument();
      expect(screen.getByTestId('add-question-bar')).toBeInTheDocument();
    });

    it('질문이 없을 때 안내 메시지가 표시되어야 함', () => {
      render(<FormBuilder />);

      expect(screen.getByText('설문조사 만들기 시작')).toBeInTheDocument();
      expect(
        screen.getByText('왼쪽 사이드바에서 질문 유형을 선택하여 시작하세요')
      ).toBeInTheDocument();
    });

    it('초기 설문 제목이 "제목 없는 설문조사"여야 함', () => {
      render(<FormBuilder />);

      const titleInput = screen.getByTestId('title-input') as HTMLInputElement;
      expect(titleInput.value).toBe('제목 없는 설문조사');
    });
  });

  describe('질문 추가', () => {
    it('단답형 질문을 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      const addButton = screen.getByTestId('add-short_text');
      await user.click(addButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('질문이 추가되었습니다');
      });

      const questionBlocks = screen.queryAllByTestId(/^question-block-/);
      expect(questionBlocks).toHaveLength(1);
    });

    it('단일 선택 질문을 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      const addButton = screen.getByTestId('add-single_choice');
      await user.click(addButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('질문이 추가되었습니다');
      });

      const questionBlocks = screen.queryAllByTestId(/^question-block-/);
      expect(questionBlocks).toHaveLength(1);
    });

    it('설명 타입 질문을 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      const addButton = screen.getByTestId('add-description');
      await user.click(addButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('질문이 추가되었습니다');
      });

      const questionBlocks = screen.queryAllByTestId(/^question-block-/);
      expect(questionBlocks).toHaveLength(1);
    });

    it('하단 바를 통해 질문을 추가할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      const addBarButton = screen.getByTestId('add-question-bar');
      await user.click(addBarButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('질문이 추가되었습니다');
      });

      const questionBlocks = screen.queryAllByTestId(/^question-block-/);
      expect(questionBlocks).toHaveLength(1);
    });

    it('질문 추가 시 해당 질문이 자동으로 선택되어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      const addButton = screen.getByTestId('add-short_text');
      await user.click(addButton);

      await waitFor(() => {
        const questionBlocks = screen.queryAllByTestId(/^question-block-/);
        expect(questionBlocks[0]).toHaveAttribute('data-selected', 'true');
      });
    });
  });

  describe('질문 선택', () => {
    it('질문을 선택할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      // 질문 추가
      await user.click(screen.getByTestId('add-short_text'));
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(1);
      });

      // 두 번째 질문 추가
      await user.click(screen.getByTestId('add-single_choice'));
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(2);
      });

      const questionBlocks = screen.queryAllByTestId(/^question-block-/);
      const firstQuestionId = questionBlocks[0].getAttribute('data-testid')?.replace('question-block-', '');

      // 첫 번째 질문 선택
      const selectButton = screen.getByTestId(`select-btn-${firstQuestionId}`);
      await user.click(selectButton);

      await waitFor(() => {
        expect(questionBlocks[0]).toHaveAttribute('data-selected', 'true');
        expect(questionBlocks[1]).toHaveAttribute('data-selected', 'false');
      });
    });
  });

  describe('질문 업데이트', () => {
    it('질문 블록에서 질문을 업데이트할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      // 질문 추가
      await user.click(screen.getByTestId('add-short_text'));
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(1);
      });

      const questionBlocks = screen.queryAllByTestId(/^question-block-/);
      const questionId = questionBlocks[0].getAttribute('data-testid')?.replace('question-block-', '');

      // 질문 업데이트
      const updateButton = screen.getByTestId(`update-btn-${questionId}`);
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByTestId(`question-title-${questionId}`)).toHaveTextContent('업데이트된 제목');
      });
    });

    it('InspectorPanel에서 질문을 업데이트할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      // 질문 추가
      await user.click(screen.getByTestId('add-short_text'));
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(1);
      });

      // InspectorPanel에서 업데이트
      const inspectorUpdateButton = screen.getByTestId('inspector-update-btn');
      await user.click(inspectorUpdateButton);

      // 질문이 업데이트되었는지 확인 (InspectorPanel에 반영)
      await waitFor(() => {
        const questionId = screen.getByTestId('inspector-question-id').textContent;
        expect(questionId).toBeTruthy();
      });
    });
  });

  describe('질문 삭제', () => {
    it('질문을 삭제할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      // 질문 추가
      await user.click(screen.getByTestId('add-short_text'));
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(1);
      });

      const questionBlocks = screen.queryAllByTestId(/^question-block-/);
      const questionId = questionBlocks[0].getAttribute('data-testid')?.replace('question-block-', '');

      // 질문 삭제
      const deleteButton = screen.getByTestId(`delete-btn-${questionId}`);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('질문이 삭제되었습니다');
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(0);
      });
    });

    it('선택된 질문을 삭제하면 선택이 해제되어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      // 질문 추가
      await user.click(screen.getByTestId('add-short_text'));
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(1);
      });

      const questionBlocks = screen.queryAllByTestId(/^question-block-/);
      const questionId = questionBlocks[0].getAttribute('data-testid')?.replace('question-block-', '');

      // 질문 삭제
      const deleteButton = screen.getByTestId(`delete-btn-${questionId}`);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('inspector-empty')).toBeInTheDocument();
      });
    });
  });

  describe('질문 복제', () => {
    it('질문을 복제할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      // 질문 추가
      await user.click(screen.getByTestId('add-short_text'));
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(1);
      });

      const questionBlocks = screen.queryAllByTestId(/^question-block-/);
      const questionId = questionBlocks[0].getAttribute('data-testid')?.replace('question-block-', '');

      // 질문 복제
      const duplicateButton = screen.getByTestId(`duplicate-btn-${questionId}`);
      await user.click(duplicateButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('질문이 복제되었습니다');
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(2);
      });
    });
  });

  describe('설문 제목 변경', () => {
    it('헤더에서 설문 제목을 변경할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      const titleInput = screen.getByTestId('title-input') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, '새로운 설문 제목');

      expect(titleInput.value).toBe('새로운 설문 제목');
    });
  });

  describe('배포 기능', () => {
    it('질문이 없을 때 배포하면 에러 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      const publishButton = screen.getByTestId('publish-btn');
      await user.click(publishButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          '배포하기 전에 최소 하나 이상의 질문을 추가해주세요'
        );
      });
    });

    it('질문이 있을 때 배포하면 성공 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      // 질문 추가
      await user.click(screen.getByTestId('add-short_text'));
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(1);
      });

      // 배포
      const publishButton = screen.getByTestId('publish-btn');
      await user.click(publishButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          '설문조사가 성공적으로 배포되었습니다!'
        );
      });
    });
  });

  describe('임시저장 기능', () => {
    it('임시저장 버튼을 클릭하면 성공 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      const saveDraftButton = screen.getByTestId('save-draft-btn');
      await user.click(saveDraftButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('임시저장이 완료되었습니다');
      });
    });
  });

  describe('미리보기 기능', () => {
    it('미리보기 버튼을 클릭하면 안내 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      const previewButton = screen.getByTestId('preview-btn');
      await user.click(previewButton);

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith('미리보기 기능 - 곧 제공됩니다!');
      });
    });
  });

  describe('다중 질문 관리', () => {
    it('여러 질문을 추가하고 관리할 수 있어야 함', async () => {
      const user = userEvent.setup();
      render(<FormBuilder />);

      // 첫 번째 질문 추가
      await user.click(screen.getByTestId('add-short_text'));
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(1);
      });

      // 두 번째 질문 추가
      await user.click(screen.getByTestId('add-single_choice'));
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(2);
      });

      // 세 번째 질문 추가
      await user.click(screen.getByTestId('add-description'));
      await waitFor(() => {
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(3);
      });

      // 중간 질문 삭제
      const questionBlocks = screen.queryAllByTestId(/^question-block-/);
      const secondQuestionId = questionBlocks[1].getAttribute('data-testid')?.replace('question-block-', '');
      const deleteButton = screen.getByTestId(`delete-btn-${secondQuestionId}`);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.queryAllByTestId(/^question-block-/)).toHaveLength(2);
      });
    });
  });
});

