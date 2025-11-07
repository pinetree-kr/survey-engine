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
  "contains_any",
  "contains_all",
  "gt",
  "lt",
  "gte",
  "lte",
  "regex",
  "is_empty",
  "not_empty",
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

// 조건 스키마 (재귀적 구조)
export const ConditionSchema: z.ZodType<any> = z.lazy(() =>
  z.union([SingleConditionSchema, ConditionGroupSchema])
);

const SingleConditionSchema: z.ZodType<any> = z.object({
  kind: z.literal("condition"),
  question_id: z.string().min(1),
  sub_key: z.string().optional(),
  operator: OperatorSchema,
  value: z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.union([z.string(), z.number()])),
    ])
    .optional(),
});

const ConditionGroupSchema: z.ZodType<any> = z.object({
  kind: z.literal("group"),
  aggregator: z.enum(["AND", "OR"]),
  children: z.array(ConditionSchema),
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
  show_conditions: ConditionSchema.optional(),
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

// 분기 규칙 스키마
export const BranchRuleSchema = z.object({
  when: ConditionSchema.optional(),
  next_question_id: z.string().min(1),
});

// 표시 조건 스키마 (Condition과 동일)
export const ShowConditionSchema = ConditionSchema;

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
  showConditions: ShowConditionSchema.optional(),
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
  SingleCondition,
  ConditionGroup,
  Condition,
  BranchRule,
  ShowCondition,
  Question,
} from "./question.types";

