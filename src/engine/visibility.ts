import type { Question, Condition, SingleCondition } from "@/schema/question.types";

/**
 * 답변 맵 타입: questionId -> value 또는 questionId -> { subKey -> value }
 */
export type AnswersMap = Map<
  string,
  string | number | boolean | string[] | Record<string, unknown>
>;

/**
 * showConditions 평가: 단일 Condition 트리 구조 평가
 */
export function evaluateShowConditions(
  question: Question,
  answers: AnswersMap
): boolean {
  const condition = question.showConditions;

  // 조건이 없으면 항상 표시
  if (!condition) {
    return true;
  }

  // Condition 트리 구조 평가
  return evaluateCondition(condition, answers);
}

/**
 * Condition 평가 (트리 구조 지원)
 */
function evaluateCondition(
  condition: Condition,
  answers: AnswersMap
): boolean {
  if (condition.kind === 'condition') {
    // 단일 조건 평가
    const answerValue = getAnswerValue(answers, condition.question_id, condition.sub_key);

    if (answerValue === undefined) {
      return false;
    }

    return compareValues(answerValue, condition.operator, condition.value);
  }

  if (condition.kind === 'group') {
    // 그룹 조건 평가
    const results = condition.children.map(child => evaluateCondition(child, answers));

    if (condition.aggregator === 'AND') {
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
  if (subKey && typeof answer === "object" && answer !== null && !Array.isArray(answer)) {
    return (answer as Record<string, unknown>)[subKey];
  }

  return answer;
}

/**
 * 값 비교 (연산자별)
 */
function compareValues(
  actual: unknown,
  operator: SingleCondition["operator"],
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
  const expectedNum = typeof expected === "number" ? expected : Number(expected);

  if (isNaN(actualNum) || isNaN(expectedNum)) {
    return false;
  }

  return compareFn(actualNum, expectedNum);
}

