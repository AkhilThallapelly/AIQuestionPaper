// API Types
export type BoardType = 'CBSE' | 'ICSE' | 'SSC';

export interface PaperGenerationRequest {
  board: BoardType;
  class_level: string;
  subject: string;
  chapters: string[];
  total_marks: number;
  difficulty_percentage: number;
  distribution: QuestionDistribution;
  output_type: 'question_paper' | 'answer_key';
}

export interface QuestionDistribution {
  mcq_count: number;
  mcq_marks: number;
  fill_blanks_count: number;
  fill_blanks_marks: number;
  short_answer_count: number;
  short_answer_marks: number;
  medium_answer_count: number;
  medium_answer_marks: number;
  long_answer_count: number;
  long_answer_marks: number;
}

export interface MCQQuestion {
  question: string;
  options: string[];
  answer: string;
  marks: number;
}

export interface FillBlankQuestion {
  question: string;
  answer: string;
  marks: number;
}

export interface AnswerQuestion {
  question: string;
  answer: string;
  marks: number;
}

// Union type for all question types
export type Question = MCQQuestion | FillBlankQuestion | AnswerQuestion;

// Type guard to check if question has options
export const hasOptions = (question: Question): question is MCQQuestion => {
  return 'options' in question;
};

export interface QuestionSection {
  type: string;
  questions: (MCQQuestion | FillBlankQuestion | AnswerQuestion)[];
  total_marks: number;
}

export interface PaperMetadata {
  board: string;
  class_level: string;
  subject: string;
  chapters: string[];
  difficulty: string;
  marks: number;
  generated_at: string;
}

export interface PaperGenerationResponse {
  metadata: PaperMetadata;
  sections: QuestionSection[];
  paper_id: string;
}

export interface AnswerKeyRequest {
  paper_id: string;
}

export interface AnswerKeyResponse {
  metadata: PaperMetadata;
  sections: QuestionSection[];
  paper_id: string;
}

export interface ReplaceQuestionRequest {
  paper_id: string;
  section_index: number;
  question_index: number;
  question_text: string;
}

export interface ReplaceQuestionResponse {
  success: boolean;
  new_question: MCQQuestion | FillBlankQuestion | AnswerQuestion | null;
  message: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
}
