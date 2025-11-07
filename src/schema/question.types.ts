export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_choice"
  | "multiple_choice"
  | "dropdown"
  | "composite_single"
  | "composite_multiple"
  | "description";

export type Operator = "eq" | "neq" | "contains" | "gt" | "lt" | "gte" | "lte";

export type ImageObj = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type Option = {
  label: string;
  key: string; // question 내 유일
  nextQuestionId?: string;
  images?: ImageObj[];
  isOther?: boolean;
  freeText?: {
    placeholder?: string;
    maxLength?: number;
    required?: boolean;
  };
};

export type CompositeItem = {
  label: string;
  input_type: "text" | "number" | "email" | "tel";
  unit?: string;
  placeholder?: string;
  key: string; // compositeItems 내 유일
  required?: boolean;
  nextQuestionId?: string;
  validations?: {
    regex?: string;
    min?: number;
    max?: number;
    maxLength?: number;
    minLength?: number;
  };
};

export type BranchCondition = {
  question_id: string;
  sub_key?: string;
  operator: Operator;
  value: string | number | boolean;
};

export type BranchRule = {
  conditions: BranchCondition[]; // AND within a rule
  nextQuestionId: string;
};

export type ShowCondition = BranchCondition; // OR across array

export type Question = {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  required?: boolean; // default false
  images?: ImageObj[];
  options?: Option[];
  compositeItems?: CompositeItem[];
  minSelect?: number;
  maxSelect?: number;
  validations?: {
    regex?: string;
    min?: number;
    max?: number;
    maxLength?: number;
    minLength?: number;
  };
  branch_logic?: BranchRule[]; // default []
  show_conditions?: ShowCondition[]; // default []
  nextQuestionId?: string; // highest priority
};

