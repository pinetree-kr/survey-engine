import type { Question } from "@/schema/question.types";

export type ValidationError = {
  code: string;
  message: string;
  meta?: Record<string, unknown>;
};

export type ValidationResult = {
  ok: boolean;
  errors: ValidationError[];
};

/**
 * 설문 무결성 검사
 */
export function validateSurvey(questions: Question[]): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. 유니크 검사: id, options[].key, compositeItems[].key
  errors.push(...validateUniqueness(questions));

  // 2. 참조 무결성: 모든 nextQuestionId/branch 참조 대상 존재
  errors.push(...validateReferences(questions));

  // 3. 도달성 검사
  errors.push(...validateReachability(questions));

  // 4. 순환 검사
  errors.push(...validateCycles(questions));

  // 5. multiple_choice minSelect/maxSelect 검사
  errors.push(...validateMultipleChoiceConstraints(questions));

  // 6. 정규식 유효성 검사
  errors.push(...validateRegexPatterns(questions));

  return {
    ok: errors.length === 0,
    errors,
  };
}

/**
 * 유니크 검사
 */
function validateUniqueness(questions: Question[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const questionIds = new Set<string>();

  // 질문 ID 중복 검사
  for (const q of questions) {
    if (questionIds.has(q.id)) {
      errors.push({
        code: "DUPLICATE_QUESTION_ID",
        message: `중복된 질문 ID: ${q.id}`,
        meta: { questionId: q.id },
      });
    }
    questionIds.add(q.id);
  }

  // 각 질문 내 options[].key 중복 검사
  for (const q of questions) {
    if (q.options) {
      const optionKeys = new Set<string>();
      for (const opt of q.options) {
        if (optionKeys.has(opt.key)) {
          errors.push({
            code: "DUPLICATE_OPTION_KEY",
            message: `질문 ${q.id}의 옵션 키 중복: ${opt.key}`,
            meta: { questionId: q.id, optionKey: opt.key },
          });
        }
        optionKeys.add(opt.key);
      }
    }
  }

  // 각 질문 내 compositeItems[].key 중복 검사
  for (const q of questions) {
    if (q.compositeItems) {
      const compositeKeys = new Set<string>();
      for (const item of q.compositeItems) {
        if (compositeKeys.has(item.key)) {
          errors.push({
            code: "DUPLICATE_COMPOSITE_KEY",
            message: `질문 ${q.id}의 컴포지트 키 중복: ${item.key}`,
            meta: { questionId: q.id, compositeKey: item.key },
          });
        }
        compositeKeys.add(item.key);
      }
    }
  }

  return errors;
}

/**
 * 참조 무결성 검사
 */
function validateReferences(questions: Question[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const questionIds = new Set(questions.map((q) => q.id));

  for (const q of questions) {
    // nextQuestionId 검사
    if (q.nextQuestionId && !questionIds.has(q.nextQuestionId)) {
      errors.push({
        code: "INVALID_NEXT_QUESTION_ID",
        message: `질문 ${q.id}의 nextQuestionId가 존재하지 않음: ${q.nextQuestionId}`,
        meta: { questionId: q.id, nextQuestionId: q.nextQuestionId },
      });
    }

    // options의 nextQuestionId 검사
    if (q.options) {
      for (const opt of q.options) {
        if (opt.nextQuestionId && !questionIds.has(opt.nextQuestionId)) {
          errors.push({
            code: "INVALID_OPTION_NEXT_QUESTION_ID",
            message: `질문 ${q.id}의 옵션 ${opt.key}의 nextQuestionId가 존재하지 않음: ${opt.nextQuestionId}`,
            meta: {
              questionId: q.id,
              optionKey: opt.key,
              nextQuestionId: opt.nextQuestionId,
            },
          });
        }
      }
    }

    // compositeItems의 nextQuestionId 검사
    if (q.compositeItems) {
      for (const item of q.compositeItems) {
        if (item.nextQuestionId && !questionIds.has(item.nextQuestionId)) {
          errors.push({
            code: "INVALID_COMPOSITE_NEXT_QUESTION_ID",
            message: `질문 ${q.id}의 컴포지트 ${item.key}의 nextQuestionId가 존재하지 않음: ${item.nextQuestionId}`,
            meta: {
              questionId: q.id,
              compositeKey: item.key,
              nextQuestionId: item.nextQuestionId,
            },
          });
        }
      }
    }

    // branch_logic의 nextQuestionId 및 question_id 검사
    if (q.branch_logic) {
      for (const rule of q.branch_logic) {
        if (!questionIds.has(rule.nextQuestionId)) {
          errors.push({
            code: "INVALID_BRANCH_NEXT_QUESTION_ID",
            message: `질문 ${q.id}의 branch_logic의 nextQuestionId가 존재하지 않음: ${rule.nextQuestionId}`,
            meta: {
              questionId: q.id,
              nextQuestionId: rule.nextQuestionId,
            },
          });
        }
        for (const cond of rule.conditions) {
          if (!questionIds.has(cond.question_id)) {
            errors.push({
              code: "INVALID_BRANCH_CONDITION_QUESTION_ID",
              message: `질문 ${q.id}의 branch_logic 조건의 question_id가 존재하지 않음: ${cond.question_id}`,
              meta: {
                questionId: q.id,
                conditionQuestionId: cond.question_id,
              },
            });
          }
        }
      }
    }

    // show_conditions의 question_id 검사
    if (q.show_conditions) {
      for (const cond of q.show_conditions) {
        if (!questionIds.has(cond.question_id)) {
          errors.push({
            code: "INVALID_SHOW_CONDITION_QUESTION_ID",
            message: `질문 ${q.id}의 show_conditions의 question_id가 존재하지 않음: ${cond.question_id}`,
            meta: {
              questionId: q.id,
              conditionQuestionId: cond.question_id,
            },
          });
        }
      }
    }
  }

  return errors;
}

/**
 * 도달성 검사 (시작 질문부터 모든 노드 도달 가능한지)
 */
function validateReachability(questions: Question[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (questions.length === 0) {
    return errors;
  }

  const questionIds = new Set(questions.map((q) => q.id));
  const visited = new Set<string>();
  const startQuestionId = questions[0].id;

  // DFS로 도달 가능한 노드 탐색
  function dfs(questionId: string) {
    if (visited.has(questionId)) {
      return;
    }
    visited.add(questionId);

    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      return;
    }

    // nextQuestionId
    if (question.nextQuestionId) {
      dfs(question.nextQuestionId);
    }

    // options의 nextQuestionId
    if (question.options) {
      for (const opt of question.options) {
        if (opt.nextQuestionId) {
          dfs(opt.nextQuestionId);
        }
      }
    }

    // compositeItems의 nextQuestionId
    if (question.compositeItems) {
      for (const item of question.compositeItems) {
        if (item.nextQuestionId) {
          dfs(item.nextQuestionId);
        }
      }
    }

    // branch_logic의 nextQuestionId
    if (question.branch_logic) {
      for (const rule of question.branch_logic) {
        dfs(rule.nextQuestionId);
      }
    }
  }

  dfs(startQuestionId);

  // 미도달 노드 찾기
  const unreachable = Array.from(questionIds).filter((id) => !visited.has(id));
  if (unreachable.length > 0) {
    errors.push({
      code: "UNREACHABLE_QUESTIONS",
      message: `도달 불가능한 질문들이 있습니다: ${unreachable.join(", ")}`,
      meta: { unreachableQuestionIds: unreachable },
    });
  }

  return errors;
}

/**
 * 순환 검사 (DFS로 사이클 탐지)
 */
function validateCycles(questions: Question[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const questionIds = new Set(questions.map((q) => q.id));
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const cyclePath: string[] = [];

  function hasCycle(questionId: string): boolean {
    if (recStack.has(questionId)) {
      // 사이클 발견
      cyclePath.push(questionId);
      return true;
    }

    if (visited.has(questionId)) {
      return false;
    }

    visited.add(questionId);
    recStack.add(questionId);
    cyclePath.push(questionId);

    const question = questions.find((q) => q.id === questionId);
    if (question) {
      // nextQuestionId
      if (question.nextQuestionId && hasCycle(question.nextQuestionId)) {
        return true;
      }

      // options의 nextQuestionId
      if (question.options) {
        for (const opt of question.options) {
          if (opt.nextQuestionId && hasCycle(opt.nextQuestionId)) {
            return true;
          }
        }
      }

      // compositeItems의 nextQuestionId
      if (question.compositeItems) {
        for (const item of question.compositeItems) {
          if (item.nextQuestionId && hasCycle(item.nextQuestionId)) {
            return true;
          }
        }
      }

      // branch_logic의 nextQuestionId
      if (question.branch_logic) {
        for (const rule of question.branch_logic) {
          if (hasCycle(rule.nextQuestionId)) {
            return true;
          }
        }
      }
    }

    recStack.delete(questionId);
    cyclePath.pop();
    return false;
  }

  // 모든 질문에 대해 사이클 검사
  for (const q of questions) {
    if (!visited.has(q.id)) {
      cyclePath.length = 0;
      if (hasCycle(q.id)) {
        errors.push({
          code: "CYCLE_DETECTED",
          message: `사이클이 감지되었습니다: ${cyclePath.join(" -> ")}`,
          meta: { cyclePath: [...cyclePath] },
        });
        break; // 첫 사이클만 보고
      }
    }
  }

  return errors;
}

/**
 * multiple_choice minSelect/maxSelect 검사
 */
function validateMultipleChoiceConstraints(
  questions: Question[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const q of questions) {
    if (q.type === "multiple_choice") {
      const minSelect = q.minSelect ?? 0;
      const maxSelect = q.maxSelect;

      if (minSelect < 0) {
        errors.push({
          code: "INVALID_MIN_SELECT",
          message: `질문 ${q.id}의 minSelect는 0 이상이어야 합니다`,
          meta: { questionId: q.id, minSelect },
        });
      }

      if (maxSelect !== undefined) {
        if (maxSelect <= 0) {
          errors.push({
            code: "INVALID_MAX_SELECT",
            message: `질문 ${q.id}의 maxSelect는 1 이상이어야 합니다`,
            meta: { questionId: q.id, maxSelect },
          });
        }

        if (minSelect > maxSelect) {
          errors.push({
            code: "INVALID_SELECT_RANGE",
            message: `질문 ${q.id}의 minSelect(${minSelect})는 maxSelect(${maxSelect}) 이하여야 합니다`,
            meta: { questionId: q.id, minSelect, maxSelect },
          });
        }
      }
    }
  }

  return errors;
}

/**
 * 정규식 유효성 검사
 */
function validateRegexPatterns(questions: Question[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const q of questions) {
    // 질문 레벨 정규식
    if (q.validations?.regex) {
      try {
        new RegExp(q.validations.regex);
      } catch (e) {
        errors.push({
          code: "INVALID_REGEX",
          message: `질문 ${q.id}의 정규식이 유효하지 않습니다: ${q.validations.regex}`,
          meta: { questionId: q.id, regex: q.validations.regex },
        });
      }
    }

    // compositeItems의 정규식
    if (q.compositeItems) {
      for (const item of q.compositeItems) {
        if (item.validations?.regex) {
          try {
            new RegExp(item.validations.regex);
          } catch (e) {
            errors.push({
              code: "INVALID_COMPOSITE_REGEX",
              message: `질문 ${q.id}의 컴포지트 ${item.key}의 정규식이 유효하지 않습니다: ${item.validations.regex}`,
              meta: {
                questionId: q.id,
                compositeKey: item.key,
                regex: item.validations.regex,
              },
            });
          }
        }
      }
    }
  }

  return errors;
}

