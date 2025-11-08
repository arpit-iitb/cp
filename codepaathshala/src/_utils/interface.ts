import React, { ReactNode } from "react";
import { Options } from "typewriter-effect";
import { GridColDef } from "@mui/x-data-grid";
import {
  DifficultyLevel,
  ProblemStatus,
  LessonType,
  AssessmentStatus,
  SnackBarSeverityLevel,
  UserPermissions,
  AssessmentType,
  examType,
} from "./enum";
import { NumberLiteralType } from "typescript";

export interface TwitterCard {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

export interface SEOInterface {
  title: string;
  description: string;
  name?: string;
  keywords?: string[];
  category?: string;
  classification?: string;
  twitter?: TwitterCard;
  image?: string;
}

export interface AssessmentInterface {
  assessmentType?: any[];
  remaining_time?: any;
  max_violations?: any;
  totalQuestions?: number;
}

export interface TypeWriter {
  component?: React.ElementType;
  options: Partial<Options>;
}

export interface FeatureCardInterface {
  icon: ReactNode;
  heading: string;
  description: string;
  gradient?: string;
}

export interface TestimonialsData {
  logo: string;
  testimonial: string;
  name: string;
  socialLink: string;
  designation: string;
  company: string;
}

export interface FaqData {
  question: string;
  answer: string;
}

export interface TabPanelInterface {
  link: string;
  description: string;
}

export interface EditorInterface {
  language: string;
  theme: string;
  codes: string;
  id: string;
  disableCopyPaste: boolean;
  onCodeChange: (code: string) => void;
}
export interface LanguageTemplate {
  [key: string]: string;
}
export interface FolderItem {
  uri: string;
  name: string;
  totalItems: number;
  videos: boolean;
  [key: string]: any;
}
export interface NavItem {
  id: string;
  icon: any;
  label: string;
}
export interface NavBarProps {
  navItems: NavItem[];
  defaultContent: string;
  isMobileMenuOpenNew: boolean;
  toggleMobileMenu: () => void;
  setActiveTab: (tabId: string) => void;
}
export interface RegisteredBatchInterface {
  id: string;
  start_date: string;
  end_date: string;
  updated_at: string;
  name: string;
  parent_batch_client_logo: string;
  parent_batch_client_name: string;
  parent_batch_description: string;
  parent_batch_name: string;
  parent_batch_weekly_topics: string;
  total_videos: number;
  completed_videos: number;
  total_problems: number;
  completed_problems: number;
  total_assignments: number;
  completed_assignments: number;
  total_mcq_assignments: number;
  completed_mcq_assignments: number;
  total_lessons: number;
  completed_lessons: number;
  total_score: number;
}

export interface ChangePasswordInterface {
  new_password: string;
  old_password?: string;
  confirm_new_password: string;
}

export interface Lesson {
  id: string;
  lesson_id: number;
  title: string;
  difficulty_level: keyof typeof DifficultyLevel;
  status: ProblemStatus;
  type: LessonType;
  priority_order: number;
  isFullStackProblem?: boolean;
  video_duration?: number;
  attempts?: number;
  score: number;
  maximum_possible_score: number;
}

export interface ProblemDataInterface {
  client_name: string;
  logo: string;
  weekwise_data: ProblemListInterface[];
}

export interface ProblemListInterface {
  id: string;
  week_number: number;
  total_lessons: number;
  total_lessons_completed: number;
  pending: number;
  canSolve: boolean;
  lessons: Lesson[];
  topic_description: string;
  isChanged?: boolean;
  total_videos: number;
  total_assignments: number;
  total_mcq_assignments: number;
  total_text_contents: number;
  total_problems: number;
  completed_videos: number;
  completed_problems: number;
  completed_assignments: number;
  completed_text_contents: number;
  completed_mcq_assignments: number;
}

export interface LoginRequest {
  username_or_email: string;
  password: string;
}
export interface PasswordResetRequest {
  email: string;
  otp: string;
  newpass: string;
  newpass_again: string;
}

export interface ReportBugRequest {
  issue_description: string;
  contact_number?: string;
  your_code?: string;
}

export interface AssessmentCardInterface {
  id: any;
  title: string;
  description: string;
  status: AssessmentStatus;
  start_date_time: string;
  end_date_time: string;
  max_marks_scored: number;
  passing_marks: number;
  prev_atempts: { score: number; date: string }[];
  Total_marks: number;
  attempts: number;
  test_id: any;
}

export interface GetAllAssessmentsInterface {
  id: string;
  name: string;
  total_test_takers: number;
}

export interface tableinterface {
  title: string;
  question_count: number;
  marks: number;
}

export interface AssessmentHeaderProps {
  title: string | undefined;
  numberofQues: number | null;
  averageAttempts: number | null;
  averageMarks: number | null;
  total_submission: number | null;
}

export interface AssessmentCardProps {
  assessment: GetAllAssessmentsInterface;
}

export interface CreateAssessmentCardProps {
  onClose: () => void;
}

export interface QuestionsforCreateSection {
  pk: any;
  title: string;
}

export interface QuestionLevelProps {
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export interface AssessmentDetailsInterface {
  total_submissions: number;
  average_marks: number | null;
  number_of_questions: number | null;
  average_attempts: number | null;
  submission_list: {
    name: string;
    email: string;
    total_marks: number;
    subjective_assignment_score: number;
    mcq_score: number;
    coding_problem_score: Number;
    resultSheet: { type: string; title: string; section_score: number }[];
  }[];
  topic_wise_avg_marks: { [topic: string]: number };
  section_wise_avg_marks: { [topic: string]: number };
  question_counts: { easy: number; medium: number; hard: number };
  marking_scheme: tableinterface[];
}

export interface AssessmentSectionInterface {
  title: string;
  sections_type: string;
  section_cutoff: number;
  Total_marks: number;
}

export interface CreateAssessmentInterface {
  test_id: string;
  title: string;
  description: string;
  language: string;
  passing_marks: number;
  total_marks: number;
  timed_assessments: boolean;
  duration: string;
  max_violations: null | number;
  proctored: boolean;
  show_result: boolean | null;
}

export interface AdminCardDataInterface {
  title: string;
  icon: string;
  tooltip: string;
  data: any;
}
export interface ProfileDataInterface {
  id: string;
  program: string;
  streak: number;
  solved_problem_count: number;
  max_streak: number;
  total_Score: number;
  current_streak: number;
  last_login: string;
  last_submission_date: string;
  linkedin_url: string;
  github_url: string;
  created_at: string;
  updated_at: string;
  user: User;
  assosiatedbatches: string[];
  solved_problems: any[];
  watched_videos: any[];
  assignment_Submission: any[];
  recent_problems: RecentProblem[];
  total_submissions: number;
  submission_count_by_date: SingleDateInterface[];
  project_id_vimeo?: any;
  client_id_vimeo?: any;
  user_id?: any;
}

export interface Title {
  id: number;
  title: string;
}

export interface Props {
  batch: string;
  weekNumber: number;
}
export interface SingleDateInterface {
  date: string;
  value: number;
}

export interface RecentProblem {
  id: any;
  batch_name: string;
  failed_testcases: string;
  judgment: AssessmentStatus;
  passed_testcases: string;
  problem: number;
  score: number;
  source_code: string;
  submission_date: string;
  time_taken: string;
  title: string;
}

export interface User {
  id?: any;
  username: string;
  email: string;
  phone_number: string;
  name: string;
  batch?: any[];
  is_staff?: boolean;
}

export interface LeaderBoard {
  rank: number;
  total_score: number;
  username: string;
  identifier: string;
}

export interface ActiveDays {
  rank: number;
  username: string;
  activeDays: number;
}
export interface LiveClass {
  meeting_id: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
}

export interface VideoData {
  id: number;
  title: string;
  description: string;
  link: string;
  pptLink: string;
  docsLink: string;
  difficulty_level: keyof typeof DifficultyLevel;
  batch_name: string;
  duration?: string;
  img_urls: string[];
  week_number?: number;
}

export interface TextData {
  id: number;
  title: string;
  description: string;
  difficulty_level: keyof typeof DifficultyLevel;
  batch_name: string;
  week_number?: number;
}
export interface SingleProblemInterface {
  id: any;
  batch_name: string;
  constraints: string;
  default_language: string;
  default_languages?: any;
  description: string;
  difficulty_level: keyof typeof DifficultyLevel;
  full_stack_evaluation: boolean;
  image_urls: string[];
  csv_link?: string;
  input_format: string;
  output_format: string;
  solution: string;
  template_codes: TemplateCode[];
  title: string;
  code?: any;
  test_cases?: any[];
  previous_submissions?: any[];
  can_solve?: boolean;
  week_number?: number;
}

export interface AssignmentIdeInterface {
  id: any;
  batch_name?: string;
  constraints?: string;
  default_language?: string;
  description?: string;
  difficulty_level?: keyof typeof DifficultyLevel;
  full_stack_evaluation?: boolean;
  image_urls?: string[];
  csv_link?: string;
  input_format: string;
  output_format: string;
  solution: string;
  title: string;
  can_solve?: boolean;
  week_number?: number;
}

export interface TemplateCode {
  language: string;
  code: string;
}

export const languageMapper: any = {
  javascript: 63,
  cpp: 54,
  clike: 49,
  java: 62,
  python: 71,
  sql: 82,
};

export interface PROBLEMDATA {
  id: any;
  batch_name: string;
  lesson_type: LessonType;
  constraints?: string;
  default_language?: string;
  description: string;
  difficulty_level: keyof typeof DifficultyLevel;
  full_stack_evaluation?: boolean;
  image_urls?: any[];
  csv_link?: string;
  input_format?: string;
  output_format?: string;
  solution?: string;
  title: string;
  template_codes?: TemplateCode[];
  link?: string;
  pptLink?: string;
  docsLink?: string;
  img_urls?: string[];
  srcDoc?: any;
  previous_submissions?: any[];
  week_number?: number;
}

export interface DiscussionRequest {
  discussion_text: string;
  batch_name: string;
}

export interface DiscussionData {
  id: any;
  discussion_text: string;
  likes: number;
  username: string;
  created_on: any;
  video?: string;
  assignment?: string;
  mcq_assignment?: string;
  batch_name: string;
}

export interface RegisterUserRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface SnackbarInterface {
  message: string;
  severity: SnackBarSeverityLevel;
  vertical: "top" | "bottom";
  horizontal: "center" | "left" | "right";
  open: boolean;
}

export interface OpenFormRegistration {
  name: string;
  email: string;
  mobile: string;
  graduation: string;
  usn?: any;
  resume_link?: string;
  college?: string;
}

export interface DataTableInterface {
  tableData: any[];
  columnDefs: GridColDef[];
  actions: UserPermissions[];
  uniqueProperty: string;
}

export interface AddUserFormAdmin {
  username: string;
  email: string;
  name: string;
  password: string;
  confirm_password: string;
  phone: string;
  batch_name: string[];
  send_mail: boolean;
}

export interface AddUserRequestBody {
  registration_data: {
    username: string;
    email: string;
    name: string;
    password: string;
    confirm_password: string;
    phone: string;
  };
  batch_name: string[];
  program: string;
  send_email: boolean;
}
export interface ShowResponseProps {
  id: string;
  questions: Question[];
}

export interface Question {
  type: string;
  questionNumber: string;
  question_text: string;
  choices: string[];
  difficulty_level: number;
  correct_answer: string;
  topic: string;
}

export interface AssessmentTestInterface {
  assessmentType: any[];
  totalQuestions: any;
  defaultAccordian: string;
  quizDataObj: any;
  testSubmitted: boolean;
  remainingTime: number;
  onAssessmentSubmitted: (data: any) => void;
  openData: any;
  violations: number;
}
export interface UploadVideo {
  selectedFolder: string | null;
  upload: boolean;
  selectedSubFolder: string | null;
  folderItems: FolderItem[];
  folderHistory: string[];
  modalOpen: boolean;
  rootCall: boolean;
  newFolderName: string;
  uploadLink: string;
  file: File | null;
  isAddingFolder: boolean;
  uploadProgress: number;
}

export interface ProblemStateInterface {
  problemList: ProblemDataInterface;
  currentWeek: number;
}

export interface AssessmentData {
  id: any;
  test_id: string;
  title: string;
  description: string;
  passing_marks: number;
  total_marks: number;
  totalQuestions: number;
  max_violations: number;
  proctored: boolean;
  brand_logo: string;
  show_result: boolean;
  duration: string;
  timed_assessment: boolean;
  assessmentType: AssessmentType[];
  assessment_items: AssessmentItem[];
}

export interface AssessmentItem {
  type: AssessmentType;
  title: string;
  easy_question_marks?: number;
  hard_question_marks?: number;
  medium_question_marks?: number;
  duration: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion
  extends Omit<
    Partial<SingleProblemInterface> & Partial<AssignmentIdeInterface>,
    "id"
  > {
  id: string;
  difficulty_level: keyof typeof DifficultyLevel;
  img_urls?: string[];
  precode?: string;
  grading_prompt?: string;
  question_text?: string;
  is_multiple?: string;
  options?: { label: string; value: string }[];
  topic?: string;
  result?: any;
  answered?: boolean;
  flagged?: boolean;
}
export interface BatchStatsResponse {
  total_user_count: number;
  active_users: number;
  user_activity: {
    [date: string]: { P: number; A: number; M: number; V: number };
  };
  completion_percent: number;
  total_mcq_assignment: number;
  total_problem: number;
  total_videos: number;
  total_assignment: number;
}

export interface TimeSpentResponse {
  average_daily_distinct_users: number;
  aggregate_time: string;
  time_spent: { [date: string]: string };
  distinct_user: any;
}
export interface StatsForm {
  total_mcq_assignment: number;
  total_problem: number;
  total_videos: number;
  total_assignment: number;
}

export interface AssessmentMCQProps {
  question: AssessmentQuestion;
  onUpdateQuestion: (updatedQuestion: AssessmentQuestion) => void;
  onNext: () => void;
  title: string;
  onPrevious: () => void;
  disableNext: boolean;
  disablePrevious: boolean;
  onAnswerSelected: (data: any) => void;
}
export interface SelectedAnswers {
  [examType.single]: {
    [key: string]: string;
  };
  [examType.multi]: {
    [key: string]: string[];
  };
}

export interface ExpandedSelectedData {
  [AssessmentType.MCQ]: {
    [key: string]: string[];
  };
  [AssessmentType.CODING]: {
    [key: string]: string[];
  };
  [AssessmentType.SUBJECTIVE]: {
    [key: string]: string[];
  };
}

export interface SelectedData {
  [examType.single]: {
    [key: string]: string;
  };
  [examType.multi]: {
    [key: string]: string[];
  };
  [examType.subjective]: {
    [key: string]: string;
  };
  [examType.coding]: {
    [key: string]: string;
  };
}
export interface SelectedDataAssessment {
  [title: string]: {
    type: string;
    answers: any;
  };
}

export interface Option {
  label: string;
  value: string;
}
export interface AssessmentInfo {
  id: number;
  test_id: string;
  title: string;
  proctored: boolean;
  brand_logo: string;
  show_result: boolean;
  timed_assessment: boolean;
}
export interface OpenAssessmentData {
  name?: string;
  email?: string;
  mobile?: string;
  graduation?: string;
  usn?: string;
  resume_link?: string;
}

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
  totalScore: number;
}

export interface SortableItemProps {
  id: string;
  section: AssessmentSectionInterface;
  opendeletecard: () => void;
}

export interface AssessmentSectionProps {
  onClose: () => void;
  IsTimed: boolean;
  test_id: any;
}
