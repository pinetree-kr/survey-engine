export type QuestionType = 
  | 'short-text'
  | 'long-text'
  | 'single-choice'
  | 'multiple-choice'
  | 'dropdown'
  | 'composite-input'
  | 'description';

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  hasOther?: boolean;
  options?: string[];
  validation?: string;
  branchLogic?: {
    questionId: string;
    condition: string;
  }[];
  showConditions?: string;
  design?: {
    imageUrl?: string;
    themeColor?: string;
    backgroundStyle?: string;
  };
}

export interface Survey {
  title: string;
  questions: Question[];
}
