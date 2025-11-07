import { z } from "zod";

// 이미지 객체 스키마
export const ImageObjSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

// 연산자 스키마
export const OperatorSchema = z.enum([
  "eq",
  "neq",
  "contains",
  "gt",
  "lt",
  "gte",
  "lte",
]);

// 옵션 스키마
export const OptionSchema = z.object({
  label: z.string().min(1),
  key: z.string().min(1),
  nextQuestionId: z.string().optional(),
  images: z.array(ImageObjSchema).optional(),
  isOther: z.boolean().optional(),
  freeText: z
    .object({
      placeholder: z.string().optional(),
      maxLength: z.number().positive().optional(),
      required: z.boolean().optional(),
    })
    .optional(),
});

// 컴포지트 아이템 스키마
export const CompositeItemSchema = z.object({
  label: z.string().min(1),
  input_type: z.enum(["text", "number", "email", "tel"]),
  unit: z.string().optional(),
  placeholder: z.string().optional(),
  key: z.string().min(1),
  required: z.boolean().optional(),
  nextQuestionId: z.string().optional(),
  validations: z
    .object({
      regex: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      maxLength: z.number().positive().optional(),
      minLength: z.number().positive().optional(),
    })
    .optional(),
});

// 분기 조건 스키마
export const BranchConditionSchema = z.object({
  questionId: z.string().min(1),
  subKey: z.string().optional(),
  operator: OperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean()]),
});

// 분기 규칙 스키마
export const BranchRuleSchema = z.object({
  conditions: z.array(BranchConditionSchema).min(1),
  nextQuestionId: z.string().min(1),
});

// 표시 조건 스키마 (BranchCondition과 동일)
export const ShowConditionSchema = BranchConditionSchema;

// 질문 스키마
export const QuestionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum([
    "short_text",
    "long_text",
    "single_choice",
    "multiple_choice",
    "dropdown",
    "composite_single",
    "composite_multiple",
    "description",
  ]),
  required: z.boolean().optional().default(false),
  images: z.array(ImageObjSchema).optional(),
  options: z.array(OptionSchema).optional(),
  compositeItems: z.array(CompositeItemSchema).optional(),
  minSelect: z.number().int().nonnegative().optional(),
  maxSelect: z.number().int().positive().optional(),
  validations: z
    .object({
      regex: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
      maxLength: z.number().positive().optional(),
      minLength: z.number().positive().optional(),
    })
    .optional(),
  branchLogic: z.array(BranchRuleSchema).optional().default([]),
  showConditions: z.array(ShowConditionSchema).optional().default([]),
  nextQuestionId: z.string().optional(),
});

// 질문 배열 스키마
export const QuestionArraySchema = z.array(QuestionSchema);

// 타입은 question.types.ts에서 import하여 사용
export type {
  ImageObj,
  Operator,
  Option,
  CompositeItem,
  BranchCondition,
  BranchRule,
  ShowCondition,
  Question,
} from "./question.types";

