import { api } from '../api';

// ── Types ────────────────────────────────────────────────────────

export type SectionType =
  | 'TEXT'
  | 'VIDEO'
  | 'FILE'
  | 'SLIDES'
  | 'STORYTELLING'
  | 'CASE_STUDY'
  | 'QUIZ'
  | 'MINDMAP'
  | 'FINAL_MESSAGE'
  | 'DASHBOARD'
  | 'EXAM_BANK';

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  status: CourseStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  modules?: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  moduleType?: 'CONTENT' | 'PROVA';
  examBankId?: string;
  createdAt: string;
  updatedAt: string;
  pages?: Page[];
}

export interface Page {
  id: string;
  moduleId: string;
  title: string;
  slug?: string;
  orderIndex: number;
  isPublished: boolean;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  pageId: string;
  type: SectionType;
  title: string;
  orderIndex: number;
  config: Record<string, unknown>;
  content: Record<string, unknown>;
}

export interface FullPage {
  id: string;
  title: string;
  slug?: string;
  orderIndex: number;
  isPublished: boolean;
  sections: Section[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  randomizeQuestions: boolean;
  questionsToShow: number;
  passingScore: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  statement: string;
  questionType: 'open' | 'multiple_choice' | 'weighted';
  axis?: string;
  weight: number;
  orderIndex: number;
  options?: QuizOption[];
}

export interface QuizOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  scoreWeight: number;
  orderIndex: number;
}

export interface ExamBank {
  _id: string;
  title: string;
  description?: string;
  courseId?: string;
  createdAt: string;
}

export interface ExamQuestion {
  _id: string;
  bankId: string;
  statement: string;
  questionType: 'open' | 'multiple_choice' | 'weighted';
  axis?: string;
  options?: { text: string; isCorrect?: boolean; scoreWeight: number }[];
  createdAt: string;
}

export interface ExamQuestionSnapshot {
  questionId: string;
  statement: string;
  questionType: 'open' | 'multiple_choice' | 'weighted';
  axis?: string;
  options: { index: number; text: string }[];
}

export interface ExamAttempt {
  _id: string;
  moduleId: string;
  bankId: string;
  userId: string;
  status: 'in_progress' | 'submitted' | 'graded';
  questions: ExamQuestionSnapshot[];
  startedAt: string;
}

export interface PlagiarismResult {
  questionId: string;
  /** true = sem plágio detectado */
  passed: boolean;
  similarAttemptIds: string[];
}

export interface CorrectorFeedback {
  questionId: string;
  feedback: string;
}

export interface AttemptForCorrection {
  _id: string;
  moduleId: string;
  bankId: string;
  questions: ExamQuestionSnapshot[];
  answers: { questionId: string; answer: string; scoreObtained: number }[];
  score: number;
  passed: boolean;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  plagiarismResults?: PlagiarismResult[];
  correctorFeedbacks?: CorrectorFeedback[];
  generalFeedback?: string;
  correctedAt?: string;
  correctorId?: string;
}

export interface ExamResult {
  attemptId: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  byAxis: Record<string, { score: number; total: number }>;
  hasOpenQuestions: boolean;
  plagiarismResults?: PlagiarismResult[];
  answers: { questionId: string; answer: string; scoreObtained: number }[];
}

export interface CourseDashboard {
  courseId: string;
  totalPages: number;
  completedPages: number;
  progressPct: number;
  lastAccess?: string;
}

// ── Internal helper ──────────────────────────────────────────────

function unwrap<T>(res: { success: boolean; data?: T; error?: string; message?: string }): T {
  if (!res.success) throw new Error(res.error ?? res.message ?? 'Erro desconhecido');
  return res.data as T;
}

// ── Service ──────────────────────────────────────────────────────

export const avaService = {
  // ── Courses ─────────────────────────────────────────────────────
  listCourses: () =>
    api.get<{ success: boolean; data: Course[] }>('/ava/courses').then(unwrap),

  getCourse: (id: string) =>
    api.get<{ success: boolean; data: Course }>(`/ava/courses/${id}`).then(unwrap),

  createCourse: (data: { title: string; description?: string; coverImageUrl?: string }) =>
    api.post<{ success: boolean; data: Course }>('/ava/courses', data).then(unwrap),

  updateCourse: (id: string, data: Partial<{ title: string; description: string; status: CourseStatus }>) =>
    api.put<{ success: boolean; data: Course }>(`/ava/courses/${id}`, data).then(unwrap),

  deleteCourse: (id: string) =>
    api.delete<{ success: boolean }>(`/ava/courses/${id}`),

  // ── Modules ─────────────────────────────────────────────────────
  listModules: (courseId: string) =>
    api.get<{ success: boolean; data: Module[] }>(`/ava/courses/${courseId}/modules`).then(unwrap),

  getModule: (id: string) =>
    api.get<{ success: boolean; data: Module }>(`/ava/modules/${id}`).then(unwrap),

  createModule: (data: {
    courseId: string;
    title: string;
    description?: string;
    orderIndex?: number;
    moduleType?: 'CONTENT' | 'PROVA';
    examBankId?: string;
  }) =>
    api.post<{ success: boolean; data: Module }>('/ava/modules', data).then(unwrap),

  updateModule: (id: string, data: Partial<Module>) =>
    api.put<{ success: boolean; data: Module }>(`/ava/modules/${id}`, data).then(unwrap),

  deleteModule: (id: string) =>
    api.delete<{ success: boolean }>(`/ava/modules/${id}`),

  reorderModules: (courseId: string, orderedIds: string[]) =>
    api.put<{ success: boolean }>('/ava/modules/reorder', { parentId: courseId, orderedIds }),

  // ── Pages ────────────────────────────────────────────────────────
  listPages: (moduleId: string) =>
    api.get<{ success: boolean; data: Page[] }>(`/ava/modules/${moduleId}/pages`).then(unwrap),

  getPage: (id: string) =>
    api.get<{ success: boolean; data: Page }>(`/ava/pages/${id}`).then(unwrap),

  getFullPage: (id: string) =>
    api.get<{ success: boolean; data: FullPage }>(`/ava/pages/${id}/full`).then(unwrap),

  createPage: (data: { moduleId: string; title: string; slug?: string; orderIndex?: number }) =>
    api.post<{ success: boolean; data: Page }>('/ava/pages', data).then(unwrap),

  updatePage: (id: string, data: Partial<{ title: string; slug: string; isPublished: boolean; orderIndex: number }>) =>
    api.put<{ success: boolean; data: Page }>(`/ava/pages/${id}`, data).then(unwrap),

  deletePage: (id: string) =>
    api.delete<{ success: boolean }>(`/ava/pages/${id}`),

  reorderPages: (moduleId: string, orderedIds: string[]) =>
    api.put<{ success: boolean }>('/ava/pages/reorder', { parentId: moduleId, orderedIds }),

  // ── Sections ─────────────────────────────────────────────────────
  listSections: (pageId: string) =>
    api.get<{ success: boolean; data: Section[] }>(`/ava/pages/${pageId}/sections`).then(unwrap),

  getSection: (id: string) =>
    api.get<{ success: boolean; data: Section }>(`/ava/sections/${id}`).then(unwrap),

  createSection: (data: { pageId: string; type: SectionType; title: string; orderIndex?: number; config?: Record<string, unknown> }) =>
    api.post<{ success: boolean; data: Section }>('/ava/sections', data).then(unwrap),

  updateSection: (id: string, data: Partial<{ title: string; orderIndex: number; config: Record<string, unknown> }>) =>
    api.put<{ success: boolean; data: Section }>(`/ava/sections/${id}`, data).then(unwrap),

  updateSectionContent: (id: string, content: Record<string, unknown>) =>
    api.put<{ success: boolean; data: Section }>(`/ava/sections/${id}/content`, { content }).then(unwrap),

  deleteSection: (id: string) =>
    api.delete<{ success: boolean }>(`/ava/sections/${id}`),

  reorderSections: (pageId: string, orderedIds: string[]) =>
    api.put<{ success: boolean }>('/ava/sections/reorder', { parentId: pageId, orderedIds }),

  // ── Quizzes ───────────────────────────────────────────────────────
  listQuizzes: () =>
    api.get<{ success: boolean; data: Quiz[] }>('/ava/quizzes').then(unwrap),

  getQuiz: (id: string) =>
    api.get<{ success: boolean; data: Quiz }>(`/ava/quizzes/${id}`).then(unwrap),

  startQuiz: (id: string) =>
    api.get<{ success: boolean; data: Quiz }>(`/ava/quizzes/${id}/start`).then(unwrap),

  createQuiz: (data: { title: string; description?: string; randomizeQuestions?: boolean; questionsToShow?: number; passingScore?: number }) =>
    api.post<{ success: boolean; data: Quiz }>('/ava/quizzes', data).then(unwrap),

  updateQuiz: (id: string, data: Partial<Quiz>) =>
    api.put<{ success: boolean; data: Quiz }>(`/ava/quizzes/${id}`, data).then(unwrap),

  deleteQuiz: (id: string) =>
    api.delete<{ success: boolean }>(`/ava/quizzes/${id}`),

  addQuizQuestion: (data: {
    quizId: string;
    statement: string;
    questionType?: 'open' | 'multiple_choice' | 'weighted';
    axis?: string;
    weight?: number;
    orderIndex?: number;
    options?: { text: string; isCorrect?: boolean; scoreWeight?: number }[];
  }) =>
    api.post<{ success: boolean; data: QuizQuestion }>('/ava/quiz-questions', data).then(unwrap),

  deleteQuizQuestion: (id: string) =>
    api.delete<{ success: boolean }>(`/ava/quiz-questions/${id}`),

  submitQuiz: (data: {
    quizId: string;
    answers: { questionId: string; selectedOptionId?: string; openAnswer?: string }[];
  }) =>
    api.post<{ success: boolean; data: unknown }>('/ava/quiz/submit', data).then(unwrap),

  // ── Exam Banks ────────────────────────────────────────────────────
  listBanks: () =>
    api.get<{ success: boolean; data: ExamBank[] }>('/ava/exam-banks').then(unwrap),

  getBank: (id: string) =>
    api.get<{ success: boolean; data: ExamBank }>(`/ava/exam-banks/${id}`).then(unwrap),

  createBank: (data: { title: string; description?: string; courseId?: string }) =>
    api.post<{ success: boolean; data: ExamBank }>('/ava/exam-banks', data).then(unwrap),

  updateBank: (id: string, data: { title?: string; description?: string }) =>
    api.put<{ success: boolean; data: ExamBank }>(`/ava/exam-banks/${id}`, data).then(unwrap),

  deleteBank: (id: string) =>
    api.delete<{ success: boolean }>(`/ava/exam-banks/${id}`),

  listBankQuestions: (bankId: string) =>
    api.get<{ success: boolean; data: ExamQuestion[] }>(`/ava/exam-banks/${bankId}/questions`).then(unwrap),

  addExamQuestion: (data: {
    bankId: string;
    statement: string;
    questionType: 'open' | 'multiple_choice' | 'weighted';
    axis?: string;
    options?: { text: string; isCorrect?: boolean; scoreWeight: number }[];
  }) =>
    api.post<{ success: boolean; data: ExamQuestion }>('/ava/exam-questions', data).then(unwrap),

  updateExamQuestion: (id: string, data: Partial<ExamQuestion>) =>
    api.put<{ success: boolean; data: ExamQuestion }>(`/ava/exam-questions/${id}`, data).then(unwrap),

  deleteExamQuestion: (id: string) =>
    api.delete<{ success: boolean }>(`/ava/exam-questions/${id}`),

  startExam: (moduleId: string, bankId: string) =>
    api.post<{ success: boolean; data: ExamAttempt }>(`/ava/modules/${moduleId}/exam/start`, { bankId }).then(unwrap),

  submitExam: (attemptId: string, answers: { questionId: string; answer: string }[]) =>
    api.post<{ success: boolean; data: ExamResult }>('/ava/exam/submit', { attemptId, answers }).then(unwrap),

  myAttempts: (moduleId?: string) =>
    api.get<{ success: boolean; data: ExamAttempt[] }>(
      moduleId ? `/ava/exam/my-attempts?moduleId=${moduleId}` : '/ava/exam/my-attempts'
    ).then(unwrap),

  // ── Corrections (corretor / admin) ────────────────────────────────
  listCorrections: (all = false) =>
    api.get<{ success: boolean; data: AttemptForCorrection[] }>(
      all ? '/ava/exam/corrections?all=true' : '/ava/exam/corrections'
    ).then(unwrap),

  getAttemptForCorrection: (id: string) =>
    api.get<{ success: boolean; data: AttemptForCorrection }>(`/ava/exam/corrections/${id}`).then(unwrap),

  submitCorrection: (
    id: string,
    feedbacks: CorrectorFeedback[],
    generalFeedback?: string,
  ) =>
    api.post<{ success: boolean; data: AttemptForCorrection }>(`/ava/exam/corrections/${id}/submit`, {
      feedbacks,
      generalFeedback,
    }).then(unwrap),

  // ── Progress ─────────────────────────────────────────────────────
  recordPageProgress: (pageId: string, timeSpentSeconds: number, completed?: boolean) =>
    api.post<{ success: boolean; data: unknown }>('/ava/progress/page', { pageId, timeSpentSeconds, completed }),

  updatePageTime: (pageId: string, seconds: number) =>
    api.post<{ success: boolean }>('/ava/progress/page/time', { pageId, seconds }),

  getCourseDashboard: (courseId: string) =>
    api.get<{ success: boolean; data: CourseDashboard }>(`/ava/progress/course/${courseId}`).then(unwrap),
};
