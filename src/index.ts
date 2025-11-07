// 스키마 타입 및 Zod 스키마
export * from "./schema/question.types";
export * from "./schema/question.zod";

// 엔진 로직
export { validateSurvey } from "./engine/integrity";
export type {
  ValidationResult as IntegrityValidationResult,
  ValidationError,
} from "./engine/integrity";

export { evaluateShowConditions } from "./engine/visibility";
export type { AnswersMap } from "./engine/visibility";

export { getNextQuestionId, getAnswer } from "./engine/next-router";

export { validateAnswer } from "./engine/validators";
export type { ValidationResult as AnswerValidationResult } from "./engine/validators";

// UI 컴포넌트
export { QuestionRenderer } from "./ui/QuestionRenderer";

