import type { Question, BranchNode, PredicateNode } from "@/schema/question.types";
import type { AnswersMap } from "./visibility";

/**
 * 다음 질문 ID 결정
 * 우선순위:
 * 1. branchRules 평가
 * 2. 선형 다음 질문 또는 완료
 */
export function getNextQuestionId(
  currentQuestion: Question,
  questions: Question[],
  answers: AnswersMap
): string | null {
  // 1. branchRules 평가
  const branchBasedNext = getBranchBasedNext(currentQuestion, answers);
  if (branchBasedNext) {
    return branchBasedNext;
  }

  // 2. 선형 다음 질문
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
      // dropdown 타입도 choice로 통합 (하위 호환성 유지)
      if (question.isDropdown) {
        return getSingleChoiceNext(question, answer as string);
      }
      if (question.isMultiple) {
        return getMultipleChoiceNext(question, answer as string[]);
      } else {
        return getSingleChoiceNext(question, answer as string);
      }
    case "dropdown":
      // 하위 호환성을 위해 유지하지만 choice로 처리
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
 * Note: Option 타입에 nextQuestionId가 없으므로 항상 null 반환
 */
function getSingleChoiceNext(
  question: Question,
  selectedKey: string
): string | null {
  // Option 타입에 nextQuestionId가 없으므로 항상 null 반환
  return null;
}

/**
 * 다중 선택의 다음 질문 결정 (첫 매칭 우선)
 * Note: Option 타입에 nextQuestionId가 없으므로 항상 null 반환
 */
function getMultipleChoiceNext(
  question: Question,
  selectedKeys: string[]
): string | null {
  // Option 타입에 nextQuestionId가 없으므로 항상 null 반환
  return null;
}

/**
 * 컴포지트의 다음 질문 결정 (정의 순서 우선)
 * Note: CompositeItem 타입에 nextQuestionId가 없으므로 항상 null 반환
 */
function getCompositeNext(
  question: Question,
  answerObj: Record<string, unknown>
): string | null {
  // CompositeItem 타입에 nextQuestionId가 없으므로 항상 null 반환
  return null;
}

/**
 * branchRules 기반 다음 질문 결정 (우선순위는 인덱스 순, 첫 매칭)
 */
function getBranchBasedNext(
  question: Question,
  answers: AnswersMap
): string | null {
  if (!question.branchRules || question.branchRules.length === 0) {
    return null;
  }

  // 배열 순서대로 평가 (우선순위는 인덱스 순)
  for (const rule of question.branchRules) {
    // when 조건이 없으면 항상 true (기본 규칙)
    if (!rule.when) {
      return rule.next_question_id;
    }

    // when 조건 평가 (현재 질문의 답변을 참조)
    const conditionMet = evaluateBranchNode(rule.when, question.id, answers);
    
    if (conditionMet) {
      return rule.next_question_id;
    }
  }

  return null;
}

/**
 * BranchNode 평가 (트리 구조 지원)
 * @param node 평가할 BranchNode
 * @param currentQuestionId 현재 질문 ID (PredicateNode가 참조할 질문)
 * @param answers 답변 맵
 */
function evaluateBranchNode(
  node: BranchNode,
  currentQuestionId: string,
  answers: AnswersMap
): boolean {
  if (node.kind === 'predicate') {
    // PredicateNode 평가 (현재 질문의 답변을 참조)
    const answerValue = getAnswerValue(
      answers,
      currentQuestionId,
      node.subKey
    );

    if (answerValue === undefined) {
      return false;
    }

    return compareValues(answerValue, node.op, node.value);
  }

  if (node.kind === 'group') {
    // GroupNode 평가
    const results = node.children.map(child => evaluateBranchNode(child, currentQuestionId, answers));
    
    if (node.op === 'AND') {
      return results.every(Boolean);
    } else {
      // OR
      return results.some(Boolean);
    }
  }

  return false;
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
  operator: PredicateNode["op"],
  expected?: string | number | boolean | Array<string | number>
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
      if (Array.isArray(actual) && (typeof expected === "string" || typeof expected === "number")) {
        return actual.includes(expected);
      }
      return false;
    case "contains_any":
      if (!Array.isArray(actual) || !Array.isArray(expected)) {
        return false;
      }
      // actual 배열에 expected 배열의 값 중 하나라도 포함되어 있는지 확인
      return expected.some(val => actual.includes(val));
    case "contains_all":
      if (!Array.isArray(actual) || !Array.isArray(expected)) {
        return false;
      }
      // actual 배열에 expected 배열의 모든 값이 포함되어 있는지 확인
      return expected.every(val => actual.includes(val));
    case "gt":
      if (typeof expected === "undefined" || Array.isArray(expected)) {
        return false;
      }
      return compareNumbers(actual, expected, (a, b) => a > b);
    case "lt":
      if (typeof expected === "undefined" || Array.isArray(expected)) {
        return false;
      }
      return compareNumbers(actual, expected, (a, b) => a < b);
    case "gte":
      if (typeof expected === "undefined" || Array.isArray(expected)) {
        return false;
      }
      return compareNumbers(actual, expected, (a, b) => a >= b);
    case "lte":
      if (typeof expected === "undefined" || Array.isArray(expected)) {
        return false;
      }
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

