import { BoardType } from '../types/api';

// Education Boards
export const EDUCATION_BOARDS = [
  { value: 'CBSE', label: 'CBSE (Central Board of Secondary Education)' },
  { value: 'ICSE', label: 'ICSE (Indian Certificate of Secondary Education)' },
  { value: 'SSC', label: 'SSC (Secondary School Certificate)' },
] as const;

// Class Levels
export const CLASS_LEVELS = [
  { value: '1', label: 'Class 1' },
  { value: '2', label: 'Class 2' },
  { value: '3', label: 'Class 3' },
  { value: '4', label: 'Class 4' },
  { value: '5', label: 'Class 5' },
  { value: '6', label: 'Class 6' },
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
  { value: '9', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
  { value: '11', label: 'Class 11' },
  { value: '12', label: 'Class 12' },
] as const;

// Subjects
export const SUBJECTS = [
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Science', label: 'Science' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Biology', label: 'Biology' },
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Social Studies', label: 'Social Studies' },
  { value: 'History', label: 'History' },
  { value: 'Geography', label: 'Geography' },
  { value: 'Civics', label: 'Civics' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Physical Education', label: 'Physical Education' },
] as const;

// Question Types
export const QUESTION_TYPES = [
  {
    key: 'mcq',
    label: 'MCQ Questions',
    countKey: 'mcq_count',
    marksKey: 'mcq_marks',
  },
  {
    key: 'fill_blanks',
    label: 'Fill in the Blanks',
    countKey: 'fill_blanks_count',
    marksKey: 'fill_blanks_marks',
  },
  {
    key: 'short_answer',
    label: 'Short Answer Questions',
    countKey: 'short_answer_count',
    marksKey: 'short_answer_marks',
  },
  {
    key: 'medium_answer',
    label: 'Medium Questions',
    countKey: 'medium_answer_count',
    marksKey: 'medium_answer_marks',
  },
  {
    key: 'long_answer',
    label: 'Long Questions',
    countKey: 'long_answer_count',
    marksKey: 'long_answer_marks',
  },
] as const;

// Default Form Values
export const DEFAULT_FORM_VALUES = {
  board: 'CBSE' as BoardType,
  class_level: '10',
  subject: 'Science',
  chapters: ['1', '2', '3'],
  total_marks: 50,
  difficulty_percentage: 70,
  distribution: {
    mcq_count: 5,
    mcq_marks: 5,
    fill_blanks_count: 5,
    fill_blanks_marks: 5,
    short_answer_count: 5,
    short_answer_marks: 10,
    medium_answer_count: 5,
    medium_answer_marks: 15,
    long_answer_count: 5,
    long_answer_marks: 15,
  },
  output_type: 'question_paper' as const,
};

// Validation Rules
export const VALIDATION_RULES = {
  total_marks: {
    min: 1,
    max: 200,
  },
  difficulty_percentage: {
    min: 10,
    max: 100,
  },
  question_count: {
    min: 0,
  },
} as const;

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  // In production, update this with your backend URL:
  // baseURL: 'https://your-backend-domain.com/api/v1',
  timeout: 120000, // 2 minutes - increased for AI generation
} as const;

// UI Configuration
export const UI_CONFIG = {
  maxChapters: 10,
  minChapters: 1,
  defaultChapters: 3,
} as const;
