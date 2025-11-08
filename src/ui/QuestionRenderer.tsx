import { useState, useMemo, useCallback } from "react";
import type { Question } from "@/schema/question.types";
import type { AnswersMap } from "@/engine/visibility";
import { evaluateShowConditions } from "@/engine/visibility";
import { getNextQuestionId } from "@/engine/next-router";
import { validateAnswer } from "@/engine/validators";

type QuestionRendererProps = {
  questions: Question[];
  onComplete?: (answers: AnswersMap) => void;
};

/**
 * 설문 렌더러 컴포넌트 (데모 목적)
 */
export function QuestionRenderer({
  questions,
  onComplete,
}: QuestionRendererProps) {
  const [answers, setAnswers] = useState<AnswersMap>(new Map());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // 완료 처리
  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete(answers);
    }
  }, [onComplete, answers]);

  // 현재 질문
  const currentQuestion = questions[currentQuestionIndex];

  // 질문이 없으면 완료 처리
  if (!currentQuestion) {
    handleComplete();
    return null;
  }

  // 표시 가능한 질문들 필터링
  const visibleQuestions = useMemo(() => {
    return questions.filter((q) => evaluateShowConditions(q, answers));
  }, [questions, answers]);

  // 현재 질문이 표시 가능한지 확인
  const isCurrentQuestionVisible = useMemo(() => {
    return evaluateShowConditions(currentQuestion, answers);
  }, [currentQuestion, answers]);

  // 진행률 계산
  const progress = useMemo(() => {
    const answeredCount = Array.from(answers.keys()).length;
    return visibleQuestions.length > 0
      ? Math.round((answeredCount / visibleQuestions.length) * 100)
      : 0;
  }, [answers, visibleQuestions.length]);

  // 답변 업데이트
  const updateAnswer = (
    questionId: string,
    value: string | number | boolean | string[] | Record<string, unknown>
  ) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, value);
    setAnswers(newAnswers);
    setValidationErrors([]);
  };

  // 다음 버튼 클릭
  const handleNext = () => {
    // 검증
    const answer = answers.get(currentQuestion.id);
    const validation = validateAnswer(currentQuestion, answer);

    if (!validation.ok) {
      setValidationErrors(validation.errors);
      return;
    }

    // 다음 질문 결정
    const nextQuestionId = getNextQuestionId(
      currentQuestion,
      questions,
      answers
    );

    if (nextQuestionId) {
      const nextIndex = questions.findIndex((q) => q.id === nextQuestionId);
      if (nextIndex !== -1) {
        setCurrentQuestionIndex(nextIndex);
      } else {
        // 다음 질문을 찾을 수 없으면 선형으로 이동
        const currentIndex = questions.findIndex(
          (q) => q.id === currentQuestion.id
        );
        if (currentIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentIndex + 1);
        } else {
          handleComplete();
        }
      }
    } else {
      // 완료
      handleComplete();
    }
  };

  // 이전 버튼 클릭
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setValidationErrors([]);
    }
  };

  // 현재 질문이 표시 불가능하면 다음으로 이동
  if (!isCurrentQuestionVisible) {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      return null;
    } else {
      handleComplete();
      return null;
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      {/* 진행 표시 */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
          질문 {currentQuestionIndex + 1} / {questions.length} ({progress}%)
        </div>
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "#4caf50",
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      {/* 질문 렌더링 */}
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ marginBottom: "10px" }}>{currentQuestion.title}</h2>
        {currentQuestion.description && (
          <p style={{ color: "#666", marginBottom: "20px" }}>
            {currentQuestion.description}
          </p>
        )}

        {/* 이미지 */}
        {currentQuestion.images &&
          currentQuestion.images.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={img.alt || ""}
              style={{
                maxWidth: img.width || "100%",
                height: img.height || "auto",
                marginBottom: "20px",
              }}
            />
          ))}

        {/* 질문 타입별 렌더링 */}
        {renderQuestionInput(currentQuestion, answers, updateAnswer)}

        {/* 검증 오류 */}
        {validationErrors.length > 0 && (
          <div style={{ color: "#f44336", marginTop: "10px" }}>
            {validationErrors.map((error, idx) => (
              <div key={idx}>{error}</div>
            ))}
          </div>
        )}
      </div>

      {/* 네비게이션 버튼 */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        {currentQuestionIndex > 0 && (
          <button
            onClick={handlePrevious}
            style={{
              padding: "10px 20px",
              backgroundColor: "#e0e0e0",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            이전
          </button>
        )}
        <button
          onClick={handleNext}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {getNextQuestionId(currentQuestion, questions, answers)
            ? "다음"
            : "완료"}
        </button>
      </div>
    </div>
  );
}

/**
 * 질문 타입별 입력 렌더링
 */
function renderQuestionInput(
  question: Question,
  answers: AnswersMap,
  updateAnswer: (
    questionId: string,
    value: string | number | boolean | string[] | Record<string, unknown>
  ) => void
) {
  const currentAnswer = answers.get(question.id);

  switch (question.type) {
    case "short_text":
    case "long_text":
      return (
        <input
          type="text"
          value={(currentAnswer as string) || ""}
          onChange={(e) => updateAnswer(question.id, e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "16px",
          }}
          placeholder={question.validations?.regex ? "형식에 맞게 입력하세요" : ""}
        />
      );

    case "choice":
    case "dropdown": {
      if (!question.options) return null;
      
      // dropdown 타입도 choice로 통합 (하위 호환성 유지)
      const isDropdown = question.type === "dropdown" || question.isDropdown;
      
      if (isDropdown) {
        // 드롭다운 렌더링 (실제 select 요소로 렌더링해야 하지만, 현재는 라디오 버튼으로 표시)
        return (
          <div>
            <select
              value={currentAnswer as string || ""}
              onChange={(e) => updateAnswer(question.id, e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "16px",
              }}
            >
              <option value="">선택하세요...</option>
              {question.options.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            {question.options.find(opt => opt.isOther && currentAnswer === opt.key)?.freeText && (
              <input
                type="text"
                placeholder={question.options.find(opt => opt.isOther && currentAnswer === opt.key)?.freeText?.placeholder || "기타 입력"}
                onChange={(e) =>
                  updateAnswer(question.id, {
                    key: currentAnswer as string,
                    freeText: e.target.value,
                  })
                }
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "5px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            )}
          </div>
        );
      }
      
      if (question.isMultiple) {
        const selectedKeys = (currentAnswer as string[]) || [];
        return (
          <div>
            {question.options.map((opt) => (
              <label
                key={opt.key}
                style={{
                  display: "block",
                  padding: "10px",
                  marginBottom: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor: selectedKeys.includes(opt.key)
                    ? "#e3f2fd"
                    : "white",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedKeys.includes(opt.key)}
                  onChange={(e) => {
                    const newKeys = e.target.checked
                      ? [...selectedKeys, opt.key]
                      : selectedKeys.filter((k) => k !== opt.key);
                    updateAnswer(question.id, newKeys);
                  }}
                  style={{ marginRight: "8px" }}
                />
                {opt.label}
              </label>
            ))}
            {question.minSelect !== undefined && (
              <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
                최소 {question.minSelect}개 선택 필요
              </div>
            )}
            {question.maxSelect !== undefined && (
              <div style={{ fontSize: "12px", color: "#666" }}>
                최대 {question.maxSelect}개 선택 가능
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div>
            {question.options.map((opt) => (
              <label
                key={opt.key}
                style={{
                  display: "block",
                  padding: "10px",
                  marginBottom: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: "pointer",
                  backgroundColor:
                    currentAnswer === opt.key ? "#e3f2fd" : "white",
                }}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={opt.key}
                  checked={currentAnswer === opt.key}
                  onChange={() => updateAnswer(question.id, opt.key)}
                  style={{ marginRight: "8px" }}
                />
                {opt.label}
                {opt.isOther && opt.freeText && currentAnswer === opt.key && (
                  <input
                    type="text"
                    placeholder={opt.freeText.placeholder || "기타 입력"}
                    onChange={(e) =>
                      updateAnswer(question.id, {
                        key: opt.key,
                        freeText: e.target.value,
                      })
                    }
                    style={{
                      marginLeft: "10px",
                      padding: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                )}
              </label>
            ))}
          </div>
        );
      }
    }

    case "composite_single":
    case "composite_multiple":
      if (!question.compositeItems) return null;
      const compositeAnswer =
        (currentAnswer as Record<string, unknown>) || {};
      return (
        <div>
          {question.compositeItems.map((item) => (
            <div key={item.key} style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {item.label}
                {item.required && <span style={{ color: "red" }}> *</span>}
              </label>
              <input
                type={item.input_type === "number" ? "number" : "text"}
                value={(compositeAnswer[item.key] as string) || ""}
                onChange={(e) => {
                  const newAnswer = {
                    ...compositeAnswer,
                    [item.key]:
                      item.input_type === "number"
                        ? Number(e.target.value)
                        : e.target.value,
                  };
                  updateAnswer(question.id, newAnswer);
                }}
                placeholder={item.placeholder || ""}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "16px",
                }}
              />
              {item.unit && (
                <span style={{ marginLeft: "8px", color: "#666" }}>
                  {item.unit}
                </span>
              )}
            </div>
          ))}
        </div>
      );

    case "description":
      return (
        <div style={{ padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
          <p>{question.description || "설명이 없습니다"}</p>
        </div>
      );

    default:
      return <div>지원하지 않는 질문 타입입니다</div>;
  }
}

