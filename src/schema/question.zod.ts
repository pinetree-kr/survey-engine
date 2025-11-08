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

// BranchNode 스키마 (재귀적 구조)
export const BranchNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.union([PredicateNodeSchema, GroupNodeSchema])
);

const PredicateNodeSchema: z.ZodType<any> = z.object({
  kind: z.literal("predicate"),
  subKey: z.string().optional(),
  op: OperatorSchema,
  value: z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.union([z.string(), z.number()])),
    ])
    .optional(),
});

const GroupNodeSchema: z.ZodType<any> = z.object({
  kind: z.literal("group"),
  op: z.enum(["AND", "OR"]),
  children: z.array(BranchNodeSchema),
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
  show_conditions: PredicateNodeSchema.optional(),
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
  when: BranchNodeSchema.optional(),
  next_question_id: z.string().min(1),
});

// ShowNode 스키마 (BranchNode와 동일한 구조)
export const ShowNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.union([PredicateNodeSchema, GroupNodeSchema])
);

// ShowRule 스키마
export const ShowRuleSchema = z.object({
  when: ShowNodeSchema.optional(),
  refQuestionId: z.string().min(1),
});

// 다중 선택 제한 스키마
export const SelectLimitSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("unlimited") }),
  z.object({ type: z.literal("exact"), value: z.number().int().positive() }),
  z.object({
    type: z.literal("range"),
    min: z.number().int().nonnegative(),
    max: z.number().int().positive(),
  }),
]);

// 질문 스키마
export const QuestionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum([
    "short_text",
    "long_text",
    "choice",
    "dropdown",
    "composite_single",
    "composite_multiple",
    "description",
  ]),
  required: z.boolean().optional().default(false),
  isMultiple: z.boolean().optional(),
  selectLimit: SelectLimitSchema.optional(),
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
  branchRules: z.array(BranchRuleSchema).optional().default([]),
  showRules: z.array(ShowRuleSchema).optional().default([]),
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
  SelectLimitType,
  SelectLimit,
  Question,
} from "./question.types";

