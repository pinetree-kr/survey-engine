import type { Question, ShowCondition } from "@/schema/question.types";

/**
 * 답변 맵 타입: questionId -> value 또는 questionId -> { subKey -> value }
 */
export type AnswersMap = Map<
  string,
  string | number | boolean | string[] | Record<string, unknown>
>;

/**
 * show_conditions 평가: OR 결합 (조건 중 하나라도 충족하면 true)
 */
export function evaluateShowConditions(
  question: Question,
  answers: AnswersMap
): boolean {
  const conditions = question.show_conditions || [];
  
  // 조건이 없으면 항상 표시
  if (conditions.length === 0) {
    return true;
  }

  // OR 결합: 하나라도 충족하면 true
  return conditions.some((condition) =>
    evaluateCondition(condition, answers)
  );
}

/**
 * 단일 조건 평가
 */
function evaluateCondition(
  condition: ShowCondition,
  answers: AnswersMap
): boolean {
  const answerValue = getAnswerValue(answers, condition.question_id, condition.sub_key);
  
  if (answerValue === undefined) {
    return false;
  }

  return compareValues(answerValue, condition.operator, condition.value);
}

/**
 * 답변 값 가져오기 (sub_key 지원)
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

  // sub_key가 있으면 객체에서 추출
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
  operator: ShowCondition["operator"],
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
  const expectedNum = typeof expected === "number" ? expected : Number(expected);
  
  if (isNaN(actualNum) || isNaN(expectedNum)) {
    return false;
  }
  
  return compareFn(actualNum, expectedNum);
}

