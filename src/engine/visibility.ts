import type { Question, BranchNode, PredicateNode, GroupNode, ShowNode, ShowRule } from "@/schema/question.types";

/**
 * 답변 맵 타입: questionId -> value 또는 questionId -> { subKey -> value }
 */
export type AnswersMap = Map<
  string,
  string | number | boolean | string[] | Record<string, unknown>
>;

/**
 * showRules 평가: 모든 규칙이 true일 때 표시
 */
export function evaluateShowConditions(
  question: Question,
  answers: AnswersMap
): boolean {
  const showRules = question.showRules;

  // 규칙이 없으면 항상 표시
  if (!showRules || showRules.length === 0) {
    return true;
  }

  // 모든 규칙이 true여야 표시됨 (AND 평가)
  return showRules.every(rule => evaluateShowRule(rule, answers));
}

/**
 * ShowRule 평가
 */
function evaluateShowRule(
  rule: ShowRule,
  answers: AnswersMap
): boolean {
  // when 조건이 없으면 항상 true
  if (!rule.when) {
    return true;
  }

  // ShowNode 평가 (참조 질문의 답변을 참조)
  return evaluateShowNode(rule.when, rule.refQuestionId, answers);
}

/**
 * ShowNode 평가 (트리 구조 지원)
 * @param node 평가할 ShowNode
 * @param refQuestionId 참조할 질문 ID
 * @param answers 답변 맵
 */
function evaluateShowNode(
  node: ShowNode,
  refQuestionId: string,
  answers: AnswersMap
): boolean {
  if (node.kind === 'predicate') {
    // PredicateNode 평가 (참조 질문의 답변을 참조)
    const answerValue = getAnswerValue(
      answers,
      refQuestionId,
      node.subKey  // PredicateNode의 subKey 사용
    );

    if (answerValue === undefined) {
      return false;
    }

    return compareValues(answerValue, node.op, node.value);
  }

  if (node.kind === 'group') {
    // GroupNode 평가
    const results = node.children.map(child => 
      evaluateShowNode(child, refQuestionId, answers)
    );
    
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
    const answerValue = getAnswerValue(answers, currentQuestionId, node.subKey);

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
  const expectedNum = typeof expected === "number" ? expected : Number(expected);

  if (isNaN(actualNum) || isNaN(expectedNum)) {
    return false;
  }

  return compareFn(actualNum, expectedNum);
}

