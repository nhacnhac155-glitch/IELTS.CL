export type SkillType = 'reading' | 'listening' | 'writing' | 'speaking' | 'vocabulary';

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string; // e.g. 'noun' | 'verb' | 'adjective' | 'adverb' | 'collocation' | 'idiom'
  vietnameseMeaning: string;
  englishDefinition?: string;
  exampleSentence?: string;
  collocations?: string[];
  synonyms?: string[];
  band?: string; // e.g. '6.5', '7.5', '8.0+'
}

export type UserRole = 'teacher' | 'student';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  studentProfileId?: string; // Links to Student ID if role is 'student'
  classId?: string;
  className?: string;
  createdAt: string;
  mustChangePassword?: boolean;
}

export interface UserAccount {
  id: string;
  username: string; // Used for login (e.g. teacher or student username/email)
  password: string; // Stored in app state / localStorage for access control
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  studentProfileId?: string;
  classId?: string;
  className?: string;
  isActive: boolean;
  createdAt: string;
}

export type QuestionType = 
  // Nhóm trắc nghiệm (Multiple Choice)
  | 'multiple_choice'            // Trắc nghiệm 1 đáp án A/B/C/D
  | 'multiple_choice_multi'      // Trắc nghiệm chọn nhiều đáp án (ví dụ: Chọn 2 trong 5 lựa chọn A-E)
  // Nhóm xác định thông tin (Identification)
  | 'true_false_ng'              // True / False / Not Given (Thông tin sự thật)
  | 'yes_no_ng'                  // Yes / No / Not Given (Quan điểm tác giả)
  // Nhóm nối (Matching)
  | 'heading_matching'           // Matching Headings (Nối tiêu đề đoạn văn: i, ii, iii, iv...)
  | 'matching_information'       // Matching Information (Nội dung thuộc đoạn nào: Paragraph A, B, C, D...)
  | 'matching_features'          // Matching Features (Nối quan điểm/phát minh với tác giả/nhân vật)
  | 'matching_sentence_endings'  // Matching Sentence Endings (Nối nửa đầu câu với nửa cuối câu A-G)
  // Nhóm điền từ (Completion)
  | 'fill_blank'                 // Sentence Completion / Fill in the blank
  | 'summary_completion'         // Summary / Note / Table / Flow-chart Completion
  | 'short_answer'               // Short-answer Questions (Tối đa 1-3 từ)
  // Nhóm sơ đồ/bản đồ (Visuals)
  | 'diagram_labeling'           // Map / Plan / Diagram Labeling
  // Kỹ năng Tự luận & Nói
  | 'essay'
  | 'speaking_prompt';

export interface MatchingOptionItem {
  key: string;   // e.g. "A", "B", "C", "i", "ii", "iii"
  label: string; // e.g. "The economic impact of urbanization"
}

export interface AnswerKeyItem {
  questionNumber: number; // 1, 2, 3...
  correctAnswer: string; // e.g. "TRUE", "B", "solar energy"
  acceptableAnswers?: string[]; // Alternate valid answers e.g. ["solar power", "solar energy"]
  explanation?: string; // Optional explanation or location in passage
  questionType?: string; // Optional question type e.g. "TRUE/FALSE/NG", "Multiple Choice", "Fill Blank"
}

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  instruction?: string; // e.g. "Choose NO MORE THAN TWO WORDS", "Choose TWO letters, A-E"
  wordLimit?: string;   // e.g. "ONE WORD ONLY", "NO MORE THAN TWO WORDS", "NO MORE THAN THREE WORDS AND/OR A NUMBER"
  options?: string[];   // for multiple choice (A, B, C, D, E...)
  correctAnswer?: string | string[]; // Single answer (e.g. "TRUE", "B", "solar energy") or multiple answers (e.g. ["B", "D"])
  explanation?: string;
  headings?: string[];  // for heading matching (i, ii, iii, iv, v, vi, vii...)
  paragraphLabel?: string; // e.g. "Paragraph A", "Section B"
  matchingOptions?: MatchingOptionItem[]; // for matching features/sentence endings
  summaryText?: string; // for summary/flow-chart/table completion with embedded blanks
  diagramImageUrl?: string; // for map/diagram labeling
  points?: number;
}

export interface Assignment {
  id: string;
  title: string;
  skill: SkillType;
  taskType?: string; // e.g. 'Task 1 - Bar Chart', 'Task 2 - Essay', 'Part 2 Cue Card', 'Academic Passage 1'
  description: string;
  targetBand: string; // e.g. '6.5', '7.0+'
  classId: string;
  className: string;
  timeLimitMinutes: number; // 0 = no limit, otherwise e.g. 60, 40, 20, 15
  deadline: string; // ISO date string
  createdAt: string;
  readingPassage?: string;
  listeningAudioUrl?: string;
  listeningScript?: string;
  writingPrompt?: string;
  writingMinWords?: number; // 150 or 250
  speakingCueCard?: {
    topic: string;
    bulletPoints: string[];
    followUpQuestions?: string[];
    prepTimeSeconds?: number;
  };
  vocabularyTopic?: string;
  vocabularyList?: VocabularyItem[];
  questions: Question[];
  // Freeform questions text & official answer sheet key
  questionsContent?: string; // Markdown / rich text with tables, headings, gap fills [___]
  answerKeyList?: AnswerKeyItem[]; // Ordered list of answers for Answer Sheet (1, 2, 3... N)
  maxScore?: number;
  authorTeacher: string;
  status: 'active' | 'closed' | 'draft';
  // Assignment image attachments (Charts, graphs, maps, illustrations for Task 1/Reading/Questions)
  assignmentImageUrl?: string;
  assignmentImages?: string[];
  // Personalized assignment fields (Giao bài tập riêng cho học sinh yếu)
  isPersonalized?: boolean;
  assignedStudentId?: string;
  assignedStudentName?: string;
  assignedReason?: string; // Lý do giao bài bổ trợ, vd: "Bổ trợ ngữ pháp Task 2 & phát âm"
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  classId: string;
  className: string;
  classIds?: string[]; // Multiple class enrollments support
  classNames?: string[]; // Multiple class names
  phone?: string;
  targetBand: number;
  currentEstimatedBand: number;
  skillScores: {
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
  };
  totalSubmissions: number;
  onTimeSubmissions: number;
  lateSubmissions: number;
  joinedDate: string; // Ngày nhập học (YYYY-MM-DD)
  expectedEndDate?: string; // Ngày kết thúc dự kiến (YYYY-MM-DD)
  notes?: string;
}

export interface SubmissionCriteriaScores {
  taskAchievement?: number; // TR or TA (0-9 or custom scale)
  coherenceCohesion?: number; // CC or Fluency (0-9 or custom scale)
  lexicalResource?: number; // LR (0-9 or custom scale)
  grammarAccuracy?: number; // GRA (0-9 or custom scale)
  pronunciation?: number; // PR (0-9 or custom scale)
}

export type ScoringSystemType = 
  | 'ielts_band'     // Thang IELTS Band 0.0 - 9.0
  | 'scale_10'        // Thang Điểm 10 (0.0 - 10.0)
  | 'scale_100'       // Thang Điểm 100 / Phần Trăm (%)
  | 'letter_grade'    // Thang Chữ A+, A, B+, B, C, D, F
  | 'cefr'            // CEFR: A1, A2, B1, B2, C1, C2
  | 'toeic_scale';    // Thang TOEIC (0 - 200 Speaking/Writing hoặc 10 - 990)

export interface CustomCriterionScore {
  key: string;
  nameVi: string;
  nameEn: string;
  score: number;
  maxScore: number;
  weightPercent?: number;
}

export interface InlineCorrection {
  id?: string;
  original: string;
  corrected: string;
  explanation: string;
  category: 'grammar' | 'vocabulary' | 'cohesion' | 'task_response' | 'spelling' | string;
  startIndex?: number;
  endIndex?: number;
  highlightColor?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  assignmentSkill: SkillType;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  timeSpentSeconds: number;
  timeLimitMinutes: number;
  status: 'submitted' | 'graded' | 'late' | 'draft';
  answers: Record<string, string>; // questionId -> answer
  essayContent?: string;
  teacherEditedContent?: string; // Direct edited version by teacher
  wordCount?: number;
  audioRecordingUrl?: string;
  audioDurationSeconds?: number;
  speakingTranscript?: string;
  
  // Grading fields
  scoringSystem?: ScoringSystemType; // Hệ thang điểm đã dùng để chấm
  scoreDisplay?: string; // Chuỗi hiển thị điểm định dạng (vd: "Band 7.0", "8.5 / 10", "Grade A (88%)")
  rawScore?: number; // for reading / listening (e.g. 8/10)
  maxRawScore?: number;
  overallBand?: number; // 0.0 - 9.0 (IELTS)
  score10?: number; // 0.0 - 10.0 (Thang điểm 10)
  score100?: number; // 0 - 100 (Thang điểm 100 / %)
  letterGrade?: string; // 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
  cefrLevel?: string; // 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  toeicScore?: number; // 0 - 200 hoặc 10 - 990
  criteriaScores?: SubmissionCriteriaScores;
  customCriteriaScores?: CustomCriterionScore[];
  teacherFeedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  inlineCorrections?: InlineCorrection[];
  sampleUpgrade?: string;
  gradedByTeacher?: boolean;
  gradedAt?: string;
  gradedBy?: string;
}

export interface ClassScheduleSession {
  id: string;
  classId: string;
  className: string;
  sessionNumber: number; // Buổi 1, Buổi 2...
  title: string; // vd: Writing Task 2 - Agree/Disagree Essay
  topic: string; // Nội dung bài giảng, từ vựng trọng tâm
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  skillFocus: 'Writing' | 'Speaking' | 'Reading' | 'Listening' | 'All-skills' | 'Grammar & Vocab' | 'Mock Test';
  materialsUrl?: string; // Link slide / tài liệu buổi học
  homeworkSummary?: string; // Tóm tắt bài về nhà
  notes?: string; // Ghi chú sư phạm cho buổi học
  status: 'upcoming' | 'completed' | 'cancelled';
  roomOrLink?: string; // Phòng học offline hoặc link Zoom/Meet
  // 1-on-1 individual tutoring fields (Hẹn thêm buổi học phụ đạo 1-1 cho học sinh yếu)
  isIndividualTutoring?: boolean;
  studentId?: string;
  studentName?: string;
  studentAvatar?: string;
  tutoringGoal?: string; // Mục tiêu buổi kèm riêng (vd: Sửa phát âm & phản xạ Speaking Part 1)
}

export interface ClassGroup {
  id: string;
  code?: string; // e.g. 'INT-88', 'FND-12', 'MAS-75'
  name: string;
  level: string; // e.g. 'IELTS 6.5+ Target', 'IELTS Foundation 5.0-5.5'
  schedule: string;
  studentCount: number;
  averageBand: number;
  teacherName: string;
  color?: string; // e.g. 'indigo', 'emerald', 'amber', 'rose', 'violet', 'cyan', 'fuchsia', 'teal', 'blue', 'orange'
}

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'absent';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string; // YYYY-MM-DD
  sessionId?: string; // Optional link to specific ClassScheduleSession
  status: AttendanceStatus;
  notes?: string;
}

export type InClassSkillType = SkillType | 'vocabulary' | 'Grammar & Vocab' | 'Mini-test' | 'Quick Quiz' | 'All-skills';

export type InClassScoreType = 'band' | 'points' | 'words' | 'percentage' | 'custom';

export interface InClassResultEntry {
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  score: number; // e.g. 7.5 or 9 (thang 10) or 18 (18/20 từ) or 85%
  maxScore: number; // e.g. 9.0 or 10 or 20 (từ) or 100
  scoreType: InClassScoreType;
  scoreUnit?: string; // e.g. 'từ', 'câu', 'điểm', 'band', '%'
  bandEquivalent?: number; // e.g. 6.5
  status: 'completed' | 'absent' | 'incomplete';
  notes?: string; // Nhận xét sư phạm nhanh trên lớp cho học sinh
}

export interface InClassResult {
  id: string;
  classId: string;
  className: string;
  title: string; // e.g. "Kiểm tra 20 từ vựng Unit 3", "Speaking Part 1 Warm-up", "Mini Test Writing Task 1"
  date: string; // YYYY-MM-DD
  skill: InClassSkillType;
  scoreType: InClassScoreType;
  maxScore: number; // 9.0 or 10 or 20 (từ) or 100
  scoreUnit?: string; // e.g. 'từ', 'câu', 'điểm', 'band', '%'
  topic?: string;
  sessionNumber?: number;
  generalNotes?: string;
  createdAt: string;
  entries: InClassResultEntry[];
}

export type TestCategory = 'mini_test' | 'mid_test' | 'final_test';

export type TestScoreScale = 'ielts_band' | 'points_10' | 'points_100' | 'raw_points' | 'percentage';

export interface TestSkillScores {
  listening?: number;
  reading?: number;
  writing?: number;
  speaking?: number;
  grammar?: number;
  vocabulary?: number;
  overall: number;
  bandEquivalent?: number; // Optional equivalent IELTS band if scored in points/raw
}

export interface TestStudentScoreEntry {
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  scores: TestSkillScores;
  targetBand?: number;
  targetScore?: number; // Target score in the active scale (e.g. 8.0 / 10)
  targetAchieved?: boolean;
  status: 'completed' | 'absent' | 'incomplete';
  strengths?: string;
  improvements?: string;
  notes?: string;
}

export interface TestRecord {
  id: string;
  classId: string;
  className: string;
  type: TestCategory; // 'mini_test' | 'mid_test' | 'final_test'
  title: string; // e.g. "Mid-term 4 Skills Assessment", "Mini Test Listening & Reading", "Final Mock Test K88"
  date: string; // YYYY-MM-DD
  format: 'four_skills' | 'single_skill' | 'custom';
  skillsEvaluated: (SkillType | 'grammar' | 'vocabulary')[];
  scoreScale?: TestScoreScale; // 'ielts_band' | 'points_10' | 'points_100' | 'raw_points' | 'percentage'
  maxScore: number; // default 9.0 for IELTS, or 10, 100, 30, 40, etc.
  scoreUnit?: string; // 'Band', 'điểm', 'câu', '%', 'từ'
  scoreType: 'band' | 'points' | 'percentage';
  autoBandConversion?: boolean;
  description?: string;
  generalNotes?: string;
  createdAt: string;
  results: TestStudentScoreEntry[];
}
