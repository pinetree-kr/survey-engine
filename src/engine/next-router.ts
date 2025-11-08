import type { Question, BranchCondition } from "@/schema/question.types";
import type { AnswersMap } from "./visibility";

/**
 * 다음 질문 ID 결정
 * 우선순위:
 * 1. 현재 질문의 nextQuestionId (최우선)
 * 2. 답변에 따른 분기 (옵션/컴포지트의 nextQuestionId)
 * 3. branchLogic 평가
 * 4. 선형 다음 질문 또는 완료
 */
export function getNextQuestionId(
  currentQuestion: Question,
  questions: Question[],
  answers: AnswersMap
): string | null {
  // 1. 현재 질문의 nextQuestionId가 있으면 무조건 그리로 이동
  if (currentQuestion.nextQuestionId) {
    return currentQuestion.nextQuestionId;
  }

  // 2. 답변에 따른 분기
  const answerBasedNext = getAnswerBasedNext(currentQuestion, answers);
  if (answerBasedNext) {
    return answerBasedNext;
  }

  // 3. branchLogic 평가
  const branchBasedNext = getBranchBasedNext(currentQuestion, answers);
  if (branchBasedNext) {
    return branchBasedNext;
  }

  // 4. 선형 다음 질문
  return getLinearNext(currentQuestion, questions);
}

/**
 * 답변 기반 다음 질문 결정
 */
function getAnswerBasedNext(
  question: Question,
  answers: AnswersMap
): string | null {
  const answer = answers.get(question.id);

  if (answer === undefined) {
    return null;
  }

  switch (question.type) {
    case "choice":
      if (question.isMultiple) {
        return getMultipleChoiceNext(question, answer as string[]);
      } else {
        return getSingleChoiceNext(question, answer as string);
      }
    case "dropdown":
      return getSingleChoiceNext(question, answer as string);

    case "composite_single":
    case "composite_multiple":
      return getCompositeNext(question, answer as Record<string, unknown>);

    default:
      return null;
  }
}

/**
 * 단일 선택의 다음 질문 결정
 */
function getSingleChoiceNext(
  question: Question,
  selectedKey: string
): string | null {
  if (!question.options) {
    return null;
  }

  const selectedOption = question.options.find((opt) => opt.key === selectedKey);
  return selectedOption?.nextQuestionId ?? null;
}

/**
 * 다중 선택의 다음 질문 결정 (첫 매칭 우선)
 */
function getMultipleChoiceNext(
  question: Question,
  selectedKeys: string[]
): string | null {
  if (!question.options) {
    return null;
  }

  // 선택된 키 순서대로 확인 (첫 매칭 우선)
  for (const key of selectedKeys) {
    const option = question.options.find((opt) => opt.key === key);
    if (option?.nextQuestionId) {
      return option.nextQuestionId;
    }
  }

  return null;
}

/**
 * 컴포지트의 다음 질문 결정 (정의 순서 우선)
 */
function getCompositeNext(
  question: Question,
  answerObj: Record<string, unknown>
): string | null {
  if (!question.compositeItems) {
    return null;
  }

  // 정의 순서대로 확인 (첫 매칭 우선)
  for (const item of question.compositeItems) {
    const value = answerObj[item.key];
    // 값이 있고 nextQuestionId가 있으면 채택
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      item.nextQuestionId
    ) {
      return item.nextQuestionId;
    }
  }

  return null;
}

/**
 * branchLogic 기반 다음 질문 결정 (AND 평가, 첫 매칭)
 */
function getBranchBasedNext(
  question: Question,
  answers: AnswersMap
): string | null {
  if (!question.branchLogic || question.branchLogic.length === 0) {
    return null;
  }

  // 배열 순서대로 평가
  for (const rule of question.branchLogic) {
    // AND 평가: 모든 조건이 충족되어야 함
    const allConditionsMet = rule.conditions.every((condition) =>
      evaluateBranchCondition(condition, answers)
    );

    if (allConditionsMet) {
      return rule.nextQuestionId;
    }
  }

  return null;
}

/**
 * 분기 조건 평가
 */
function evaluateBranchCondition(
  condition: BranchCondition,
  answers: AnswersMap
): boolean {
  const answerValue = getAnswerValue(
    answers,
    condition.questionId,
    condition.subKey
  );

  if (answerValue === undefined) {
    return false;
  }

  return compareValues(answerValue, condition.operator, condition.value);
}

/**
 * 답변 값 가져오기 (subKey 지원)
 */
function getAnswerValue(
  answers: AnswersMap,
  questionId: string,
  subKey?: string
): unknown {
  const answer = answers.get(questionId);

  if (answer === undefined) {
    return undefined;
  }

  // subKey가 있으면 객체에서 추출
  if (
    subKey &&
    typeof answer === "object" &&
    answer !== null &&
    !Array.isArray(answer)
  ) {
    return (answer as Record<string, unknown>)[subKey];
  }

  return answer;
}

/**
 * 값 비교 (연산자별)
 */
function compareValues(
  actual: unknown,
  operator: BranchCondition["operator"],
  expected: string | number | boolean
): boolean {
  switch (operator) {
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    case "contains":
      if (typeof actual === "string" && typeof expected === "string") {
        return actual.includes(expected);
      }
      if (Array.isArray(actual)) {
        return actual.includes(expected);
      }
      return false;
    case "gt":
      return compareNumbers(actual, expected, (a, b) => a > b);
    case "lt":
      return compareNumbers(actual, expected, (a, b) => a < b);
    case "gte":
      return compareNumbers(actual, expected, (a, b) => a >= b);
    case "lte":
      return compareNumbers(actual, expected, (a, b) => a <= b);
    default:
      return false;
  }
}

/**
 * 숫자 비교 헬퍼
 */
function compareNumbers(
  actual: unknown,
  expected: string | number | boolean,
  compareFn: (a: number, b: number) => boolean
): boolean {
  const actualNum = typeof actual === "number" ? actual : Number(actual);
  const expectedNum =
    typeof expected === "number" ? expected : Number(expected);

  if (isNaN(actualNum) || isNaN(expectedNum)) {
    return false;
  }

  return compareFn(actualNum, expectedNum);
}

/**
 * 선형 다음 질문 결정
 */
function getLinearNext(
  currentQuestion: Question,
  questions: Question[]
): string | null {
  const currentIndex = questions.findIndex((q) => q.id === currentQuestion.id);

  if (currentIndex === -1) {
    return null;
  }

  // 다음 질문이 있으면 반환
  if (currentIndex < questions.length - 1) {
    return questions[currentIndex + 1].id;
  }

  // 마지막 질문이면 완료
  return null;
}

/**
 * 답변 가져오기 유틸리티 (외부에서 사용)
 */
export function getAnswer(
  answers: AnswersMap,
  questionId: string,
  subKey?: string
): unknown {
  return getAnswerValue(answers, questionId, subKey);
}

