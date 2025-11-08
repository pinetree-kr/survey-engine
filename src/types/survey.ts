import { Question } from '@/schema/question.types';

// 새로운 스키마 타입을 재사용
export type {
  QuestionType,
  Question,
  BranchRule,
  BranchNode,
  PredicateNode,
  GroupNode,
  ShowRule,
  ShowNode,
  Option,
  Operator,
  SelectLimitType,
  SelectLimit,
} from '@/schema/question.types';

// 섹션 타입
export interface Section {
  id: string;
  title: string;
  order: number;
}

// UI 빌더용 호환 타입 (기존 코드와의 호환성 유지)
export interface Survey {
  title: string;
  questions: Question[];
  sections?: Section[];
}
