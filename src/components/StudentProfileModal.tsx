import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Target, 
  Award, 
  Clock, 
  BookOpen, 
  Headphones, 
  PenTool, 
  Mic, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Save, 
  Download, 
  Flame, 
  GraduationCap, 
  Sparkles, 
  PlusCircle, 
  Trash2, 
  Check, 
  Link as LinkIcon, 
  MapPin, 
  Tag, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  Send,
  HelpCircle,
  Clock3,
  CalendarCheck,
  CalendarDays,
  UserX,
  TrendingUp,
  AlertOctagon,
  Activity,
  Camera,
  ArrowLeft,
  ChevronLeft
} from 'lucide-react';
import { 
  Assignment, 
  AttendanceRecord,
  AttendanceStatus,
  ClassGroup,
  ClassScheduleSession, 
  InClassResult, 
  SkillType, 
  Student, 
  Submission, 
  TestRecord 
} from '../types';
import { formatDateTime, formatSecondsToTime, getBandColorClass, getTimeRemaining, roundIELTSBand } from '../utils/formatters';
import { SkillBadge } from './SkillBadge';
import { ClassBadge } from './ClassBadge';
import { StorageService } from '../services/storage';
import { StudentFeedbackViewModal } from './StudentFeedbackViewModal';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  submissions: Submission[];
  assignments?: Assignment[];
  inClassResults?: InClassResult[];
  testRecords?: TestRecord[];
  classes?: ClassGroup[];
  onUpdateStudentNotes: (studentId: string, notes: string) => void;
  onUpdateStudentAvatar?: (studentId: string, newAvatar: string) => void;
  onSavePersonalizedAssignment?: (assignment: Assignment) => void;
  onSaveScheduleSession?: (session: ClassScheduleSession) => void;
  onOpenGrading?: (submission: Submission, assignment?: Assignment) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  submissions,
  assignments,
  inClassResults,
  testRecords,
  classes,
  onUpdateStudentNotes,
  onUpdateStudentAvatar,
  onSavePersonalizedAssignment,
  onSaveScheduleSession,
  onOpenGrading,
}) => {
  const [notes, setNotes] = useState(student.notes || '');
  const [isSavedNotes, setIsSavedNotes] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url && onUpdateStudentAvatar) {
          onUpdateStudentAvatar(student.id, base64Url);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'attendance' | 'personalized_assignments' | 'tutoring_sessions' | 'in_class' | 'tests' | 'submissions'>('overview');
  const [attendanceFilterStatus, setAttendanceFilterStatus] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [submissionSkillFilter, setSubmissionSkillFilter] = useState<string>('all');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>('all');
  const [submissionViewMode, setSubmissionViewMode] = useState<'cards' | 'table'>('cards');
  const [viewingFeedbackSubmission, setViewingFeedbackSubmission] = useState<{ submission: Submission; assignment?: Assignment } | null>(null);

  // Sub-modals for adding personalized assignment & scheduling 1-on-1 tutoring
  const [isAddingPersonalizedAssign, setIsAddingPersonalizedAssign] = useState(false);
  const [isAddingTutoringSession, setIsAddingTutoringSession] = useState(false);

  // Local state for assignments and schedules to provide instant UI reactivity
  const [localAssignments, setLocalAssignments] = useState<Assignment[]>(() => assignments || StorageService.getAssignments());
  const [localSchedules, setLocalSchedules] = useState<ClassScheduleSession[]>(() => StorageService.getSchedules());

  // Form states for Personalized Assignment
  const [assignSkill, setAssignSkill] = useState<SkillType>('writing');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDescription, setAssignDescription] = useState('');
  const [assignReason, setAssignReason] = useState('');
  const [assignTargetBand, setAssignTargetBand] = useState(student.targetBand ? `${student.targetBand}` : '6.5');
  const [assignTimeLimit, setAssignTimeLimit] = useState<number>(30);
  const [assignDeadlineDate, setAssignDeadlineDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [assignDeadlineTime, setAssignDeadlineTime] = useState('23:59');
  const [assignPromptText, setAssignPromptText] = useState('');

  // Form states for 1-on-1 Tutoring Session
  const [tutorTitle, setTutorTitle] = useState(`[Kèm 1-1] Phụ đạo tăng cường - ${student.name}`);
  const [tutorSkill, setTutorSkill] = useState<ClassScheduleSession['skillFocus']>('Writing');
  const [tutorDate, setTutorDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [tutorStartTime, setTutorStartTime] = useState('19:30');
  const [tutorEndTime, setTutorEndTime] = useState('20:30');
  const [tutorRoomOrLink, setTutorRoomOrLink] = useState('Google Meet: https://meet.google.com/ielts-1on1');
  const [tutorGoal, setTutorGoal] = useState('Sửa lỗi ngữ pháp & phát âm, giải đáp thắc mắc bài tập');
  const [tutorNotes, setTutorNotes] = useState('Học sinh xem lại các bài tập tuần trước trước khi vào buổi học.');

  useEffect(() => {
    setNotes(student.notes || '');
  }, [student]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allInClassResults = inClassResults || StorageService.getInClassResults();
  const allTestRecords = testRecords || StorageService.getTestRecords();

  // Enrolled classes for this student
  const enrolledClassIds = student.classIds && student.classIds.length > 0 ? student.classIds : [student.classId];
  const enrolledClasses = enrolledClassIds.map((cid, idx) => {
    const found = classes?.find((c) => c.id === cid);
    const fallbackName = student.classNames?.[idx] || student.className || 'Lớp học';
    return {
      id: cid,
      name: found?.name || fallbackName,
      color: found?.color || 'blue',
      description: (found as any)?.description,
      schedule: found?.schedule,
    };
  });

  // Filter personalized assignments for THIS student only
  const studentPersonalizedAssignments = localAssignments.filter(
    (a) => a.assignedStudentId === student.id || (a.isPersonalized && a.assignedStudentId === student.id)
  );

  // Filter 1-on-1 Tutoring Sessions for THIS student
  const studentTutoringSessions = localSchedules.filter(
    (s) => s.isIndividualTutoring && (s.studentId === student.id || s.title.includes(student.name))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Extract attendance records for THIS student
  const allAttendance = StorageService.getAttendance();
  const studentAttendance = allAttendance
    .filter((a) => a.studentId === student.id || a.studentName.toLowerCase() === student.name.toLowerCase())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const presentCount = studentAttendance.filter((a) => a.status === 'present').length;
  const lateCount = studentAttendance.filter((a) => a.status === 'late').length;
  const excusedCount = studentAttendance.filter((a) => a.status === 'excused').length;
  const unexcusedCount = studentAttendance.filter((a) => a.status === 'absent').length;
  const totalAbsentCount = excusedCount + unexcusedCount;
  const totalMarkedSessions = studentAttendance.length;

  const attendanceRate = totalMarkedSessions > 0
    ? Math.round(((presentCount + lateCount * 0.75) / totalMarkedSessions) * 100)
    : 100;

  // Tutoring / Supplementary sessions count
  const completedTutoringSessions = studentTutoringSessions.filter((s) => s.status === 'completed');
  const upcomingTutoringSessions = studentTutoringSessions.filter((s) => s.status === 'upcoming');
  const tutoringCount = studentTutoringSessions.length;

  // Calculate course duration and days remaining
  const joinedDateVal = student.joinedDate || '2026-06-15';
  const expectedEndDateVal = student.expectedEndDate || (() => {
    const d = new Date(joinedDateVal);
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  })();

  const joinDateObj = new Date(joinedDateVal);
  const endDateObj = new Date(expectedEndDateVal);
  const nowObj = new Date();
  const totalCourseDays = Math.max(1, Math.round((endDateObj.getTime() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.round((nowObj.getTime() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.round((endDateObj.getTime() - nowObj.getTime()) / (1000 * 60 * 60 * 24));
  const courseProgressPercent = Math.min(100, Math.max(0, Math.round((daysElapsed / totalCourseDays) * 100)));

  // Extract test results for this student
  const studentTestEntries = allTestRecords
    .map((t) => {
      const res = t.results.find((r) => r.studentId === student.id);
      if (!res) return null;
      return {
        testId: t.id,
        classId: t.classId,
        title: t.title,
        type: t.type,
        date: t.date,
        className: t.className,
        description: t.description,
        scoreScale: t.scoreScale || (t.scoreType === 'band' ? 'ielts_band' : 'points_10'),
        maxScore: t.maxScore || (t.scoreType === 'band' ? 9.0 : 10),
        scoreUnit: t.scoreUnit || (t.scoreType === 'band' ? 'Band' : 'điểm'),
        scoreType: t.scoreType,
        skillsEvaluated: t.skillsEvaluated || ['listening', 'reading', 'writing', 'speaking'],
        autoBandConversion: t.autoBandConversion,
        result: res,
      };
    })
    .filter(Boolean) as {
      testId: string;
      classId?: string;
      title: string;
      type: 'mini_test' | 'mid_test' | 'final_test';
      date: string;
      className: string;
      description?: string;
      scoreScale?: any;
      maxScore?: number;
      scoreUnit?: string;
      scoreType?: any;
      skillsEvaluated?: string[];
      autoBandConversion?: boolean;
      result: any;
    }[];
  
  // Extract all in-class exercises this student participated in
  const studentInClassEntries = allInClassResults
    .map((r) => {
      const entry = r.entries.find((e) => e.studentId === student.id);
      if (!entry) return null;
      return {
        activityId: r.id,
        classId: r.classId,
        title: r.title,
        date: r.date,
        skill: r.skill,
        scoreType: r.scoreType,
        maxScore: r.maxScore,
        sessionNumber: r.sessionNumber,
        topic: r.topic,
        entry,
      };
    })
    .filter(Boolean) as {
      activityId: string;
      classId?: string;
      title: string;
      date: string;
      skill: any;
      scoreType: 'band' | 'points' | 'percentage';
      maxScore: number;
      sessionNumber?: number;
      topic?: string;
      entry: NonNullable<(typeof allInClassResults)[0]['entries'][0]>;
    }[];

  // Load all submissions from props or persistent storage
  const allSubmissions = submissions && submissions.length > 0 ? submissions : StorageService.getSubmissions();
  const studentSubmissions = allSubmissions.filter(
    (s) => s.studentId === student.id || (s.studentName && s.studentName.toLowerCase() === student.name.toLowerCase())
  ).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  // Assignments applicable to this student
  const studentClassAssignments = localAssignments.filter((a) => {
    if (a.isPersonalized || a.assignedStudentId) {
      return a.assignedStudentId === student.id;
    }
    if (student.classIds && student.classIds.length > 0) {
      return student.classIds.includes(a.classId) || a.classId === 'all';
    }
    return a.classId === student.classId || a.classId === 'all';
  });

  const submittedAssignmentIds = new Set(studentSubmissions.map((s) => s.assignmentId));
  const pendingAssignments = studentClassAssignments.filter((a) => !submittedAssignmentIds.has(a.id));
  const gradedSubs = studentSubmissions.filter((s) => s.status === 'graded' && typeof s.overallBand === 'number');
  
  const avgHomeworkBand = gradedSubs.length > 0
    ? roundIELTSBand(gradedSubs.reduce((acc, curr) => acc + (curr.overallBand || 0), 0) / gradedSubs.length)
    : null;

  const homeworkCompletionRate = studentClassAssignments.length > 0
    ? Math.min(100, Math.round((studentSubmissions.length / studentClassAssignments.length) * 100))
    : 100;

  const onTimeSubs = studentSubmissions.filter((s) => {
    const assign = localAssignments.find((a) => a.id === s.assignmentId);
    if (!assign || !assign.deadline) return true;
    return new Date(s.submittedAt).getTime() <= new Date(assign.deadline).getTime();
  });

  const onTimeRate = studentSubmissions.length > 0
    ? Math.round((onTimeSubs.length / studentSubmissions.length) * 100)
    : 100;

  // Breakdown statistics by individual class (when student is enrolled in 2+ classes)
  const classBreakdown = enrolledClasses.map((cls) => {
    const clsTests = studentTestEntries.filter((t) => {
      return t.classId === cls.id || t.className.toLowerCase().includes(cls.name.toLowerCase());
    });

    const clsInClass = studentInClassEntries.filter((ic) => {
      return ic.classId === cls.id;
    });

    const clsAttendance = studentAttendance.filter((att) => att.classId === cls.id);
    const clsPresent = clsAttendance.filter((a) => a.status === 'present').length;
    const clsLate = clsAttendance.filter((a) => a.status === 'late').length;
    const clsAbsent = clsAttendance.filter((a) => a.status === 'absent' || a.status === 'excused').length;
    const clsTotal = clsAttendance.length;
    const clsRate = clsTotal > 0 ? Math.round(((clsPresent + clsLate * 0.75) / clsTotal) * 100) : 100;

    const clsSubmissions = studentSubmissions.filter((sub) => {
      const assign = localAssignments.find((a) => a.id === sub.assignmentId);
      return assign?.classId === cls.id;
    });

    const validTestBands = clsTests
      .map((t) => t.result.scores.overall)
      .filter((s): s is number => typeof s === 'number' && !isNaN(s) && s > 0);
    const avgTestScore = validTestBands.length > 0
      ? (validTestBands.reduce((a, b) => a + b, 0) / validTestBands.length).toFixed(1)
      : null;

    return {
      classInfo: cls,
      tests: clsTests,
      inClass: clsInClass,
      attendance: clsAttendance,
      presentCount: clsPresent,
      lateCount: clsLate,
      absentCount: clsAbsent,
      attendanceRate: clsRate,
      submissions: clsSubmissions,
      avgTestScore,
    };
  });

  // Filtered datasets for active tab views when selectedClassFilter is applied
  const filteredStudentAttendance = studentAttendance.filter((rec) => {
    if (selectedClassFilter !== 'all' && rec.classId && rec.classId !== selectedClassFilter) {
      return false;
    }
    if (attendanceFilterStatus === 'all') return true;
    if (attendanceFilterStatus === 'present') return rec.status === 'present';
    if (attendanceFilterStatus === 'absent') return rec.status === 'absent' || rec.status === 'excused';
    if (attendanceFilterStatus === 'late') return rec.status === 'late';
    return true;
  });

  const filteredStudentTestEntries = studentTestEntries.filter((item) => {
    if (selectedClassFilter === 'all') return true;
    const clsName = classes?.find((c) => c.id === selectedClassFilter)?.name || '';
    return item.classId === selectedClassFilter || (clsName && item.className.toLowerCase().includes(clsName.toLowerCase()));
  });

  const filteredStudentInClassEntries = studentInClassEntries.filter((item) => {
    if (selectedClassFilter === 'all') return true;
    return item.classId === selectedClassFilter;
  });

  const filteredStudentSubmissions = studentSubmissions.filter((sub) => {
    if (selectedClassFilter !== 'all') {
      const assign = localAssignments.find((a) => a.id === sub.assignmentId);
      if (assign?.classId && assign.classId !== selectedClassFilter) return false;
    }
    if (submissionSkillFilter !== 'all' && sub.assignmentSkill !== submissionSkillFilter) {
      return false;
    }
    if (submissionStatusFilter === 'graded' && sub.status !== 'graded') {
      return false;
    }
    if (submissionStatusFilter === 'pending' && sub.status !== 'submitted') {
      return false;
    }
    return true;
  });

  const handleSaveNotes = () => {
    onUpdateStudentNotes(student.id, notes);
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2000);
  };

  const punctualityRate = student.totalSubmissions > 0 
    ? Math.round((student.onTimeSubmissions / student.totalSubmissions) * 100)
    : 100;

  // Preset suggestions for personalized assignments
  const assignmentPresets: Record<SkillType, { title: string; desc: string; reason: string; prompt: string }[]> = {
    writing: [
      {
        title: 'Chữa Lỗi Ngữ Pháp & Cấu Trúc Câu Phức (Writing Task 2)',
        desc: 'Viết lại 5 câu phức sử dụng mệnh đề quan hệ & liên từ chỉ nguyên nhân/kết quả.',
        reason: 'Cần củng cố cấu trúc câu và tránh lỗi sai thì quá khứ/hiện tại hoàn thành.',
        prompt: 'Hãy viết 1 đoạn văn (khoảng 100-120 từ) trả lời câu hỏi: Why is learning English important for young people today? Chú ý dùng ít nhất 3 câu phức và 2 từ nối học thuật.'
      },
      {
        title: 'Luyện Dàn Ý & Luận Cứ Chặt Chẽ: Task 2 Topic Education',
        desc: 'Lập dàn ý chi tiết gồm Topic Sentence, Supporting Ideas & Examples cho đề bài giáo dục.',
        reason: 'Học sinh hay bị bí ý tưởng và lập luận còn rời rạc.',
        prompt: 'Đề bài: Some people believe that universities should focus on providing job skills, while others think they should focus on academic theory. Discuss both views and give your opinion. Hãy viết đoạn Thân bài 1 (Body 1) hoàn chỉnh.'
      }
    ],
    speaking: [
      {
        title: 'Luyện Phát Âm Ending Sounds & Phản Xạ Speaking Part 1',
        desc: 'Ghi âm trả lời 4 câu hỏi Part 1 chủ đề Daily Routine & Free Time, chú ý phát âm rõ âm cuối /s/, /z/, /ed/.',
        reason: 'Học sinh phát âm hay bị nuốt âm đuôi và thiếu tự tin khi phản xạ.',
        prompt: '1. What do you usually do in your free time?\n2. Do you prefer spending time alone or with friends?\n3. How has your weekend routine changed compared to the past?'
      },
      {
        title: 'Luyện Part 2 Cue Card: Kể Lại Một Trải Nghiệm Đáng Nhớ',
        desc: 'Chuẩn bị 1 phút và ghi âm bài nói 2 phút liên tục, sử dụng thì quá khứ đơn và quá khứ tiếp diễn.',
        reason: 'Học sinh cần tăng độ trôi chảy (Fluency) và duy trì mạch nói 2 phút.',
        prompt: 'Describe an unforgettable trip you went on. You should say: Where you went, Who you went with, What you did there, and explain why this trip was memorable.'
      }
    ],
    reading: [
      {
        title: 'Luyện Kỹ Năng Skimming & Scanning Đoạn Văn 1 (IELTS Reading)',
        desc: 'Luyện tìm từ khóa đồng nghĩa (Paraphrasing) và trả lời 6 câu hỏi True/False/Not Given.',
        reason: 'Học sinh làm bài Reading còn chậm và dễ bị lừa bởi từ đồng nghĩa.',
        prompt: 'Đọc đoạn văn ngắn và xác định từ đồng nghĩa cho các từ khóa chính, trả lời các câu hỏi đi kèm.'
      }
    ],
    listening: [
      {
        title: 'Luyện Nghe Chi Tiết Section 1: Note-taking Tên, Số & Email',
        desc: 'Luyện tập nghe chính xác tên riêng đánh vần, số điện thoại, ngày tháng và địa chỉ.',
        reason: 'Học sinh còn hay nhầm lẫn giữa các chữ cái tiếng Anh như A-E-I, J-G, 14-40.',
        prompt: 'Nghe audio và điền thông tin vào form đăng ký khóa học tiếng Anh.'
      }
    ],
    vocabulary: [
      {
        title: 'Luyện 25 Collocations Cốt Lõi B2-C1: Topic Environment',
        desc: 'Học và làm bài tập vận dụng các cụm từ vựng quan trọng về môi trường & biến đổi khí hậu.',
        reason: 'Vốn từ vựng của học sinh còn hạn chế, cần nâng cấp Lexical Resource lên 6.0+.',
        prompt: 'Sử dụng các cụm từ: carbon footprint, renewable energy, environmental degradation, combat climate change để đặt câu hoàn chỉnh.'
      }
    ]
  };

  // Preset suggestions for 1-on-1 tutoring sessions
  const tutoringPresets = [
    {
      title: `[Kèm 1-1] Phụ Đạo Ngữ Pháp & Dàn Ý Writing Task 2 - ${student.name}`,
      skill: 'Writing' as const,
      goal: 'Chữa chi tiết bài viết Task 2, hướng dẫn cách phát triển luận điểm và sửa lỗi ngữ pháp thường gặp.',
      durationMinutes: 60,
    },
    {
      title: `[Kèm 1-1] Sửa Phát Âm, Ending Sounds & Phản Xạ Speaking - ${student.name}`,
      skill: 'Speaking' as const,
      goal: 'Chỉnh khẩu hình miệng, âm cuối /s/, /z/, /t/, /d/, và luyện phản xạ trả lời nhanh Part 1.',
      durationMinutes: 45,
    },
    {
      title: `[Kèm 1-1] Hướng Dẫn Kỹ Thuật Đọc Hiểu True/False/Not Given - ${student.name}`,
      skill: 'Reading' as const,
      goal: 'Chỉ ra bẫy thường gặp trong dạng bài T/F/NG và cách quét keyword paraphrased.',
      durationMinutes: 45,
    },
    {
      title: `[Kèm 1-1] Tổng Ôn Kỹ Năng & Giải Đáp Thắc Mắc Trước Kỳ Thi - ${student.name}`,
      skill: 'All-skills' as const,
      goal: 'Đánh giá lại 4 kỹ năng, củng cố tâm lý và dặn dò chiến thuật làm bài thi đạt Target Band.',
      durationMinutes: 60,
    },
  ];

  // Handle creating a new personalized assignment
  const handleCreatePersonalizedAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim()) return;

    const newAssign: Assignment = {
      id: `assign-pers-${Date.now()}`,
      title: assignTitle.trim(),
      skill: assignSkill,
      taskType: assignSkill === 'writing' ? 'Task 2 - Essay' : assignSkill === 'speaking' ? 'Part 1 & 2' : 'Reinforcement',
      description: assignDescription.trim() || 'Bài tập bổ trợ riêng được giao theo năng lực học sinh.',
      targetBand: assignTargetBand,
      classId: student.classId,
      className: student.className,
      timeLimitMinutes: Number(assignTimeLimit) || 0,
      deadline: `${assignDeadlineDate}T${assignDeadlineTime}:00`,
      createdAt: new Date().toISOString(),
      writingPrompt: assignSkill === 'writing' ? (assignPromptText || assignDescription) : undefined,
      speakingCueCard: assignSkill === 'speaking' ? {
        topic: assignTitle,
        bulletPoints: assignPromptText ? assignPromptText.split('\n').filter(Boolean) : ['Explain your ideas clearly', 'Use appropriate vocabulary'],
        prepTimeSeconds: 60,
      } : undefined,
      readingPassage: assignSkill === 'reading' ? (assignPromptText || 'Passage text...') : undefined,
      questions: [],
      authorTeacher: 'Giáo Viên Chủ Nhiệm',
      status: 'active',
      // Individual tracking fields
      isPersonalized: true,
      assignedStudentId: student.id,
      assignedStudentName: student.name,
      assignedReason: assignReason.trim() || 'Bổ trợ kỹ năng còn yếu theo lộ trình cá nhân.',
    };

    // Save to persistent storage
    StorageService.addAssignment(newAssign);

    // Update local state
    setLocalAssignments((prev) => [newAssign, ...prev]);

    // Callback to parent if exists
    if (onSavePersonalizedAssignment) {
      onSavePersonalizedAssignment(newAssign);
    }

    setIsAddingPersonalizedAssign(false);
    setAssignTitle('');
    setAssignDescription('');
    setAssignReason('');
    setAssignPromptText('');
  };

  // Handle scheduling a 1-on-1 tutoring session
  const handleCreateTutoringSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorTitle.trim() || !tutorDate) return;

    const newSession: ClassScheduleSession = {
      id: `sch-tutoring-${Date.now()}`,
      classId: student.classId,
      className: student.className,
      sessionNumber: studentTutoringSessions.length + 1,
      title: tutorTitle.trim(),
      topic: tutorGoal.trim() || 'Phụ đạo cá nhân 1-1',
      date: tutorDate,
      startTime: tutorStartTime,
      endTime: tutorEndTime,
      skillFocus: tutorSkill,
      roomOrLink: tutorRoomOrLink.trim() || 'Google Meet / Phòng học',
      notes: tutorNotes.trim() || undefined,
      status: 'upcoming',
      // 1-on-1 fields
      isIndividualTutoring: true,
      studentId: student.id,
      studentName: student.name,
      studentAvatar: student.avatar,
      tutoringGoal: tutorGoal.trim() || 'Bổ trợ kiến thức & kỹ năng yếu',
    };

    // Save to persistent storage
    StorageService.addScheduleSession(newSession);

    // Update local state
    setLocalSchedules((prev) => [newSession, ...prev]);

    // Callback to parent if exists
    if (onSaveScheduleSession) {
      onSaveScheduleSession(newSession);
    }

    setIsAddingTutoringSession(false);
    setTutorTitle(`[Kèm 1-1] Phụ đạo tăng cường - ${student.name}`);
  };

  const handleToggleTutoringStatus = (sessionId: string, newStatus: 'upcoming' | 'completed' | 'cancelled') => {
    const updated = localSchedules.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s));
    setLocalSchedules(updated);
    StorageService.saveSchedules(updated);
  };

  const handleDeleteTutoringSession = (sessionId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch hẹn buổi học kèm này?')) return;
    const updated = localSchedules.filter((s) => s.id !== sessionId);
    setLocalSchedules(updated);
    StorageService.saveSchedules(updated);
  };

  const handleDeletePersonalizedAssignment = (assignmentId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài tập riêng này?')) return;
    const updated = localAssignments.filter((a) => a.id !== assignmentId);
    setLocalAssignments(updated);
    StorageService.saveAssignments(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col w-full h-full overflow-hidden animate-in fade-in duration-200">
      {/* Top Global Navigation Bar */}
      <header className="bg-slate-950 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
            title="Quay lại danh sách (phím Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <div className="h-4 w-px bg-slate-700 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Hồ Sơ &amp; Lộ Trình Học Viên</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-bold tracking-tight">{student.name}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 font-mono font-bold border border-blue-700/50">
              Target Band {student.targetBand.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setIsAddingPersonalizedAssign(true);
              setIsAddingTutoringSession(false);
            }}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Giao bài riêng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAddingTutoringSession(true);
              setIsAddingPersonalizedAssign(false);
            }}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Lịch kèm 1-1</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            title="Đóng giao diện hồ sơ (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Đóng</span>
          </button>
        </div>
      </header>

      {/* Main Full-Screen Layout Wrapper */}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden bg-slate-100">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-4 sm:p-6 relative border-b border-blue-900/50 shrink-0">
          <div className="max-w-[1920px] mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <div 
                  className="relative group cursor-pointer shrink-0" 
                  onClick={() => avatarInputRef.current?.click()}
                  title="Bấm để đổi ảnh đại diện cho học sinh này"
                >
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md group-hover:border-blue-400 transition-all"
                  />
                  <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
                    <span className="text-[9px] text-white font-medium mt-0.5">Đổi ảnh</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">{student.name}</h2>
                    <div className="flex items-center gap-1 flex-wrap">
                      {enrolledClasses.map((cls) => (
                        <ClassBadge
                          key={cls.id}
                          classId={cls.id}
                          classes={classes}
                          fallbackText={cls.name}
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-200/90 mt-1">
                    Email: <span className="font-mono">{student.email}</span> • SĐT: {student.phone || '0912 345 678'}
                  </p>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs text-blue-100/90 mt-2">
                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                      <CalendarDays className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Nhập học: <strong className="text-white font-medium">{formatDateTime(joinedDateVal)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                      <Clock3 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Dự kiến kết thúc: <strong className="text-white font-medium">{formatDateTime(expectedEndDateVal)}</strong></span>
                      {daysRemaining >= 0 ? (
                        <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded-md font-bold">
                          Còn {daysRemaining} ngày
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded-md font-bold">
                          Đã kết thúc khóa
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Band & Target Badges */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/15 self-stretch sm:self-auto justify-around">
                <div className="text-center px-3 sm:px-4 border-r border-white/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                    Band Hiện Tại
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                    {student.currentEstimatedBand.toFixed(1)}
                  </span>
                </div>
                <div className="text-center px-3 sm:px-4 border-r border-white/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                    Mục Tiêu Target
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {student.targetBand.toFixed(1)}
                  </span>
                </div>
                <div className="text-center px-3 sm:px-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                    Chuyên Cần
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
                    {attendanceRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons for Weaker Students: Giao bài riêng & Hẹn buổi học kèm */}
            <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setIsAddingPersonalizedAssign(true);
                  setIsAddingTutoringSession(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Giao Bài Tập Riêng (Bổ Trợ)</span>
                {studentPersonalizedAssignments.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-slate-950 text-amber-400 rounded-md text-[11px] font-mono font-black">
                    {studentPersonalizedAssignments.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAddingTutoringSession(true);
                  setIsAddingPersonalizedAssign(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Calendar className="w-4 h-4 text-blue-200" />
                <span>Hẹn Buổi Học Kèm 1-1 (Đồng Bộ Lịch)</span>
                {studentTutoringSessions.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-md text-[11px] font-mono font-black">
                    {studentTutoringSessions.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Class Switcher Filter Bar (when student is enrolled in 2+ classes) */}
        {enrolledClasses.length > 1 && (
          <div className="bg-slate-900 px-4 sm:px-6 py-2.5 border-b border-slate-800 flex items-center gap-2 flex-wrap text-xs text-white">
            <span className="text-blue-300 font-bold flex items-center gap-1.5 mr-1">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Học sinh thuộc {enrolledClasses.length} lớp học:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedClassFilter('all')}
              className={`px-3 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedClassFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              🎯 Tất cả các lớp ({enrolledClasses.length})
            </button>
            {enrolledClasses.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassFilter(cls.id)}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedClassFilter === cls.id
                    ? 'bg-white text-slate-950 shadow-sm font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>{cls.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 shrink-0 shadow-2xs">
          <div className="max-w-[1920px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveProfileTab('overview')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeProfileTab === 'overview'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Tổng Quan &amp; Kỹ Năng</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveProfileTab('attendance')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeProfileTab === 'attendance'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Báo Cáo Chuyên Cần &amp; Bổ Trợ</span>
              <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                attendanceRate >= 85 ? 'bg-emerald-100 text-emerald-800' : attendanceRate >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {attendanceRate}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveProfileTab('personalized_assignments')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeProfileTab === 'personalized_assignments'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Bài Tập Riêng Bổ Trợ</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 font-bold">
                {studentPersonalizedAssignments.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveProfileTab('tutoring_sessions')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeProfileTab === 'tutoring_sessions'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Lịch Học Kèm 1-1</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-800 font-bold">
                {studentTutoringSessions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveProfileTab('in_class')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeProfileTab === 'in_class'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Điểm Trên Lớp ({studentInClassEntries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveProfileTab('tests')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeProfileTab === 'tests'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Bài Test ({studentTestEntries.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveProfileTab('submissions')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeProfileTab === 'submissions'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Kết Quả Bài Tập Trên App ({studentSubmissions.length})</span>
              {avgHomeworkBand && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 font-mono">
                  Band {avgHomeworkBand.toFixed(1)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50/70">
          <div className="max-w-[1920px] mx-auto space-y-6">

          {/* ================= MODAL/FORM: GIAO BÀI TẬP RIÊNG CHO HỌC SINH YẾU ================= */}
          {isAddingPersonalizedAssign && (
            <div className="p-5 sm:p-6 bg-amber-50/80 border-2 border-amber-300 rounded-3xl space-y-5 animate-in fade-in slide-in-from-top-3 duration-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Giao Bài Tập Riêng / Bổ Trợ Cá Nhân Cho Học Sinh: <span className="text-amber-900">{student.name}</span>
                    </h3>
                    <p className="text-xs text-amber-800">
                      Bài tập này chỉ hiển thị riêng trong hồ sơ &amp; giao diện của học sinh này (không hiển thị tới cả lớp).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingPersonalizedAssign(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Gợi Ý Mẫu Bài Bổ Trợ Nhanh (Click để tự động điền form):
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(assignmentPresets).flatMap(([sk, presets]) => 
                    presets.map((p, idx) => (
                      <button
                        key={`${sk}-${idx}`}
                        type="button"
                        onClick={() => {
                          setAssignSkill(sk as SkillType);
                          setAssignTitle(p.title);
                          setAssignDescription(p.desc);
                          setAssignReason(p.reason);
                          setAssignPromptText(p.prompt);
                        }}
                        className="px-3 py-1.5 text-xs bg-white hover:bg-amber-100 text-slate-800 font-semibold rounded-xl border border-amber-200 shadow-2xs transition-colors text-left"
                      >
                        ⚡ {p.title}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <form onSubmit={handleCreatePersonalizedAssignment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kỹ năng bổ trợ <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={assignSkill}
                      onChange={(e) => setAssignSkill(e.target.value as SkillType)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="writing">✍️ Writing (Viết luận &amp; Ngữ pháp)</option>
                      <option value="speaking">🗣️ Speaking (Phát âm &amp; Phản xạ)</option>
                      <option value="reading">📖 Reading (Đọc hiểu &amp; Từ vựng)</option>
                      <option value="listening">🎧 Listening (Nghe hiểu &amp; Note-taking)</option>
                      <option value="vocabulary">📚 Vocabulary &amp; Collocations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Band mục tiêu
                    </label>
                    <select
                      value={assignTargetBand}
                      onChange={(e) => setAssignTargetBand(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="5.5">Band 5.5</option>
                      <option value="6.0">Band 6.0</option>
                      <option value="6.5">Band 6.5</option>
                      <option value="7.0">Band 7.0</option>
                      <option value="7.5+">Band 7.5+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thời lượng làm bài
                    </label>
                    <select
                      value={assignTimeLimit}
                      onChange={(e) => setAssignTimeLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                    >
                      <option value={0}>Không giới hạn thời gian</option>
                      <option value={15}>15 phút (Luyện phản xạ nhanh)</option>
                      <option value={30}>30 phút</option>
                      <option value={45}>45 phút</option>
                      <option value={60}>60 phút (Chuẩn 1 bài full)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tiêu đề bài tập riêng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="vd: Chữa lỗi ngữ pháp thì &amp; cấu trúc câu phức Task 2"
                    value={assignTitle}
                    onChange={(e) => setAssignTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lý do / Mục tiêu giao bổ trợ cho học sinh này
                    </label>
                    <input
                      type="text"
                      placeholder="vd: Học sinh còn yếu thì quá khứ và cách dùng từ nối"
                      value={assignReason}
                      onChange={(e) => setAssignReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hạn nộp (Ngày) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={assignDeadlineDate}
                        onChange={(e) => setAssignDeadlineDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Giờ nộp
                      </label>
                      <input
                        type="time"
                        value={assignDeadlineTime}
                        onChange={(e) => setAssignDeadlineTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đề bài / Câu hỏi chi tiết / Dặn dò học sinh
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Nhập đề bài Writing, câu hỏi Speaking hoặc hướng dẫn chi tiết cho học sinh làm bài..."
                    value={assignPromptText}
                    onChange={(e) => setAssignPromptText(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPersonalizedAssign(false)}
                    className="px-4 py-2 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Giao Bài Tập Riêng Ngay</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= MODAL/FORM: HẸN BUỔI HỌC KÈM 1-1 ================= */}
          {isAddingTutoringSession && (
            <div className="p-5 sm:p-6 bg-blue-50/80 border-2 border-blue-300 rounded-3xl space-y-5 animate-in fade-in slide-in-from-top-3 duration-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-600 text-white rounded-xl font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Hẹn Thêm Buổi Học Phụ Đạo 1-1 Cho Học Sinh: <span className="text-blue-900">{student.name}</span>
                    </h3>
                    <p className="text-xs text-blue-700">
                      Buổi học này sẽ được tự động đồng bộ vào <strong>Thời Khóa Biểu Của Tôi</strong> và hiển thị riêng trên lịch của học sinh.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingTutoringSession(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Preset Buttons for Tutoring */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Mẫu Lịch Hẹn Phụ Đạo Nhanh:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {tutoringPresets.map((tp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTutorTitle(tp.title);
                        setTutorSkill(tp.skill);
                        setTutorGoal(tp.goal);
                      }}
                      className="px-3 py-1.5 text-xs bg-white hover:bg-blue-100 text-slate-800 font-semibold rounded-xl border border-blue-200 shadow-2xs transition-colors text-left"
                    >
                      📅 {tp.title}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreateTutoringSession} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kỹ năng trọng tâm <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={tutorSkill}
                      onChange={(e) => setTutorSkill(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Writing">Writing (Viết luận &amp; Ngữ pháp)</option>
                      <option value="Speaking">Speaking (Phát âm &amp; Phản xạ)</option>
                      <option value="Reading">Reading (Đọc hiểu &amp; Kỹ thuật)</option>
                      <option value="Listening">Listening (Nghe hiểu &amp; Bắt âm)</option>
                      <option value="Grammar & Vocab">Grammar &amp; Vocabulary</option>
                      <option value="All-skills">Tổng hợp 4 kỹ năng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ngày hẹn học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={tutorDate}
                      onChange={(e) => setTutorDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bắt đầu
                      </label>
                      <input
                        type="time"
                        value={tutorStartTime}
                        onChange={(e) => setTutorStartTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kết thúc
                      </label>
                      <input
                        type="time"
                        value={tutorEndTime}
                        onChange={(e) => setTutorEndTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tiêu đề buổi kèm 1-1 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="vd: [Kèm 1-1] Phụ đạo phát âm &amp; giải đề Task 2 - Nguyễn Minh Anh"
                    value={tutorTitle}
                    onChange={(e) => setTutorTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Địa điểm / Link học online (Google Meet / Zoom)
                    </label>
                    <input
                      type="text"
                      placeholder="vd: Google Meet: meet.google.com/abc-xyz hoặc Phòng 204"
                      value={tutorRoomOrLink}
                      onChange={(e) => setTutorRoomOrLink(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mục tiêu buổi phụ đạo
                    </label>
                    <input
                      type="text"
                      placeholder="vd: Sửa lỗi phát âm âm đuôi và chữa 2 bài Task 1"
                      value={tutorGoal}
                      onChange={(e) => setTutorGoal(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ghi chú dặn dò học sinh chuẩn bị
                  </label>
                  <input
                    type="text"
                    placeholder="vd: Chuẩn bị sẵn dàn ý bài viết và các câu hỏi thắc mắc trước buổi học"
                    value={tutorNotes}
                    onChange={(e) => setTutorNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingTutoringSession(false)}
                    className="px-4 py-2 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Lưu &amp; Đồng Bộ Vào Thời Khóa Biểu</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 1: TỔNG QUAN & PHÂN BỐ KỸ NĂNG ================= */}
          {activeProfileTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Quick Metrics Bar (5 Cards including Attendance & Tutoring) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Số buổi đi học</p>
                    <p className="text-base font-black text-emerald-700">{presentCount} buổi <span className="text-xs font-normal text-slate-500">({attendanceRate}%)</span></p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Số buổi vắng</p>
                    <p className="text-base font-black text-rose-600">
                      {totalAbsentCount} buổi 
                      <span className="text-[10px] block font-normal text-slate-400">
                        {unexcusedCount > 0 ? `${unexcusedCount} KP` : '0 KP'} • {excusedCount > 0 ? `${excusedCount} CP` : '0 CP'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Đi muộn</p>
                    <p className="text-base font-black text-amber-700">{lateCount} buổi</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Học kèm bổ trợ</p>
                    <p className="text-base font-black text-indigo-700">{tutoringCount} buổi <span className="text-xs font-normal text-slate-500">({completedTutoringSessions.length} xong)</span></p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Tổng bài nộp</p>
                    <p className="text-base font-black text-slate-900">{student.totalSubmissions} bài <span className="text-xs font-normal text-slate-500">({punctualityRate}%)</span></p>
                  </div>
                </div>
              </div>

              {/* Báo Cáo Chuyên Cần & Tiến Độ Khóa Học Card */}
              <div className="p-5 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/30 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Báo Cáo Chuyên Cần &amp; Lộ Trình Khóa Học
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Theo dõi chi tiết số buổi đi học, vắng mặt, học bổ trợ và thời gian nhập học / kết thúc dự kiến
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveProfileTab('attendance')}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <span>Xem Chi Tiết Lịch Sử Chuyên Cần</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Attendance Rate & Status */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Tỷ Lệ Chuyên Cần</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        attendanceRate >= 90 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : attendanceRate >= 75 
                          ? 'bg-blue-100 text-blue-800' 
                          : attendanceRate >= 60 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {attendanceRate >= 90 ? '✅ Xuất Sắc' : attendanceRate >= 75 ? '👍 Khá Tốt' : attendanceRate >= 60 ? '⚠️ Cần Lưu Ý' : '🚨 Cảnh Báo Vắng'}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black font-mono text-slate-900">{attendanceRate}%</span>
                      <span className="text-xs text-slate-500 font-medium">({presentCount + lateCount}/{totalMarkedSessions} buổi tham gia)</span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          attendanceRate >= 80 ? 'bg-emerald-500' : attendanceRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${attendanceRate}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100/60">
                        <span className="text-slate-500 block text-[10px]">Có mặt đúng giờ:</span>
                        <strong className="text-emerald-700 font-bold">{presentCount} buổi</strong>
                      </div>
                      <div className="bg-rose-50/70 p-2 rounded-xl border border-rose-100/60">
                        <span className="text-slate-500 block text-[10px]">Vắng mặt:</span>
                        <strong className="text-rose-700 font-bold">{totalAbsentCount} buổi</strong> ({unexcusedCount} KP)
                      </div>
                    </div>
                  </div>

                  {/* Course Timeline & Progress */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Lộ Trình Khóa Học</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                        {daysRemaining >= 0 ? `Còn ${daysRemaining} ngày` : 'Hoàn thành'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Ngày nhập học:</span>
                        <strong className="font-mono text-slate-800">{formatDateTime(joinedDateVal)}</strong>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Dự kiến kết thúc:</span>
                        <strong className="font-mono text-slate-800">{formatDateTime(expectedEndDateVal)}</strong>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Tiến độ khóa học</span>
                        <span>{courseProgressPercent}% ({daysElapsed}/{totalCourseDays} ngày)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${courseProgressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Tutoring & Supplementary Action */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700">Học Bổ Trợ &amp; Kèm 1-1</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          {tutoringCount} buổi đã xếp
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        Đã hoàn thành <strong className="text-emerald-600">{completedTutoringSessions.length} buổi</strong>, còn <strong className="text-indigo-600">{upcomingTutoringSessions.length} buổi</strong> sắp diễn ra.
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingTutoringSession(true);
                          setIsAddingPersonalizedAssign(false);
                        }}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>+ Hẹn Buổi Học Kèm Bổ Trợ 1-1</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveProfileTab('attendance')}
                        className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all text-center cursor-pointer"
                      >
                        Xem Toàn Bộ Nhật Ký Điểm Danh
                      </button>
                    </div>
                  </div>
                </div>

                {/* Latest Attendance Mini-History */}
                {studentAttendance.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/70">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Nhật Ký Các Buổi Điểm Danh Gần Đây ({Math.min(3, studentAttendance.length)}/{studentAttendance.length} buổi)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {studentAttendance.slice(0, 3).map((rec) => (
                        <div key={rec.id} className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-slate-800">{rec.date}</span>
                            {rec.notes && <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{rec.notes}</p>}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.status === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : rec.status === 'excused'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {rec.status === 'present' ? 'Có mặt' : rec.status === 'late' ? 'Đi muộn' : rec.status === 'excused' ? 'Có phép' : 'Vắng mặt'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ================= BÁO CÁO PHÂN TÁCH KẾT QUẢ THEO TỪNG LỚP HỌC (MULTI-CLASS) ================= */}
              {enrolledClasses.length > 1 && (
                <div className="p-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-3xl border border-indigo-800/80 shadow-md space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>Báo Cáo Phân Tách Kết Quả Riêng Từng Lớp Học</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 border border-amber-400/40 text-amber-300">
                            {enrolledClasses.length} Lớp đang theo học
                          </span>
                        </h3>
                        <p className="text-xs text-blue-200 mt-0.5">
                          Học sinh sinh hoạt cùng lúc tại nhiều lớp. Bảng dưới đây thể hiện độc lập kết quả học tập &amp; chuyên cần ở mỗi lớp:
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classBreakdown.map((item) => (
                      <div
                        key={item.classInfo.id}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3 hover:border-amber-400/50 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                              <span className="text-sm font-black text-amber-300 uppercase tracking-wide">
                                {item.classInfo.name}
                              </span>
                            </div>
                            {item.classInfo.schedule && (
                              <span className="text-[11px] text-blue-200 block font-mono mt-0.5">
                                📅 {item.classInfo.schedule}
                              </span>
                            )}
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.attendanceRate >= 80 ? 'bg-emerald-500/30 text-emerald-200' : 'bg-amber-500/30 text-amber-200'
                          }`}>
                            Chuyên cần: {item.attendanceRate}%
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[10px] text-blue-200 block font-medium">Điểm Test TB</span>
                            <span className="text-base font-black text-amber-300 font-mono block my-0.5">
                              {item.avgTestScore ? `Band ${item.avgTestScore}` : '—'}
                            </span>
                            <span className="text-[9px] text-blue-300 block">{item.tests.length} bài test</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[10px] text-blue-200 block font-medium">Bài Trên Lớp</span>
                            <span className="text-base font-black text-white font-mono block my-0.5">
                              {item.inClass.length} bài
                            </span>
                            <span className="text-[9px] text-emerald-300 block">
                              {item.inClass.filter((i) => i.entry.status === 'completed').length} hoàn thành
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-[10px] text-blue-200 block font-medium">Điểm Danh</span>
                            <span className="text-base font-black text-emerald-300 font-mono block my-0.5">
                              {item.presentCount}/{item.attendance.length || 0}
                            </span>
                            <span className="text-[9px] text-rose-300 block">
                              {item.absentCount > 0 ? `Vắng ${item.absentCount}b` : '0 vắng'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-blue-200">
                            📚 {item.submissions.length} bài tập về nhà
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClassFilter(item.classInfo.id);
                              setActiveProfileTab('tests');
                            }}
                            className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer bg-white/10 px-2.5 py-1 rounded-lg hover:bg-white/20 transition-colors"
                          >
                            <span>Lọc dữ liệu lớp này</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4 Skills Breakdown Progress */}
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>Phân Bố Năng Lực 4 Kỹ Năng (IELTS Skill Trajectory)</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    Target: Band {student.targetBand.toFixed(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    { name: 'Reading (Đọc hiểu)', key: 'reading' as const, icon: BookOpen, color: 'bg-blue-600', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
                    { name: 'Listening (Nghe hiểu)', key: 'listening' as const, icon: Headphones, color: 'bg-purple-600', textColor: 'text-purple-700', bgLight: 'bg-purple-50' },
                    { name: 'Writing (Viết luận)', key: 'writing' as const, icon: PenTool, color: 'bg-amber-600', textColor: 'text-amber-700', bgLight: 'bg-amber-50' },
                    { name: 'Speaking (Nói & Phát âm)', key: 'speaking' as const, icon: Mic, color: 'bg-emerald-600', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50' },
                  ].map((skill) => {
                    const score = student.skillScores[skill.key];
                    const percentage = (score / 9.0) * 100;
                    return (
                      <div key={skill.key} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${skill.bgLight} ${skill.textColor}`}>
                              <skill.icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-800">{skill.name}</span>
                          </div>
                          <span className="text-base font-black font-mono text-slate-900">
                            {score.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 9.0</span>
                          </span>
                        </div>

                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${skill.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ================= KẾT QUẢ BÀI TẬP & LUYỆN TẬP TRÊN APP (ONLINE APP SUBMISSIONS) ================= */}
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-600 text-white rounded-xl font-bold shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>Kết Quả Bài Tập &amp; Luyện Tập Trên App</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {studentSubmissions.length} bài đã nộp
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tổng hợp kết quả làm bài tập trực tuyến (Writing, Speaking, Reading, Listening, Từ vựng) trên hệ thống app.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveProfileTab('submissions')}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <span>Xem Toàn Bộ Lịch Sử Bài Nộp</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4 Homework Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[11px] text-slate-500 font-medium block">Tỉ lệ hoàn thành bài</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl font-black font-mono text-slate-900">{homeworkCompletionRate}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {studentSubmissions.length}/{studentClassAssignments.length} bài được giao
                    </span>
                  </div>

                  <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100">
                    <span className="text-[11px] text-amber-800 font-medium block">Điểm Band TB bài tập</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl font-black font-mono text-amber-900">
                        {avgHomeworkBand ? `Band ${avgHomeworkBand.toFixed(1)}` : '—'}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-700 block mt-1">
                      {gradedSubs.length} bài đã chấm điểm
                    </span>
                  </div>

                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                    <span className="text-[11px] text-emerald-800 font-medium block">Tỉ lệ nộp đúng hạn</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl font-black font-mono text-emerald-900">{onTimeRate}%</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 block mt-1">
                      {onTimeSubs.length}/{studentSubmissions.length || 1} bài đúng deadline
                    </span>
                  </div>

                  <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100">
                    <span className="text-[11px] text-rose-800 font-medium block">Bài tập chưa nộp</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xl font-black font-mono text-rose-900">{pendingAssignments.length}</span>
                      <span className="text-xs text-rose-600 font-medium">bài</span>
                    </div>
                    <span className="text-[10px] text-rose-700 block mt-1">
                      Đang chờ học sinh làm
                    </span>
                  </div>
                </div>

                {/* Grid: Recent Submissions & Pending Homework */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                  
                  {/* Left: Recent Submissions List with Quick Detail & Grade Actions */}
                  <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bài Nộp Gần Đây Trên App ({Math.min(3, studentSubmissions.length)}/{studentSubmissions.length})</span>
                      </span>
                    </div>

                    {studentSubmissions.length === 0 ? (
                      <div className="p-4 text-center bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                        Học sinh chưa nộp bài tập nào trên app.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {studentSubmissions.slice(0, 3).map((sub) => {
                          const matchedAssign = localAssignments.find((a) => a.id === sub.assignmentId);
                          return (
                            <div
                              key={sub.id}
                              className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <SkillBadge skill={sub.assignmentSkill} size="sm" />
                                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                                      {sub.assignmentTitle}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    Nộp lúc: {formatDateTime(sub.submittedAt)} • Thời gian làm: {formatSecondsToTime(sub.timeSpentSeconds)}
                                  </p>
                                </div>

                                <div className="shrink-0 text-right">
                                  {sub.overallBand ? (
                                    <span className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs ${getBandColorClass(sub.overallBand)}`}>
                                      Band {sub.overallBand.toFixed(1)}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      Chờ chấm
                                    </span>
                                  )}
                                </div>
                              </div>

                              {sub.teacherFeedback && (
                                <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg line-clamp-2 border border-slate-100">
                                  <strong className="text-slate-700">GV nhận xét:</strong> {sub.teacherFeedback}
                                </p>
                              )}

                              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => setViewingFeedbackSubmission({ submission: sub, assignment: matchedAssign })}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  Xem Chi Tiết Bài Làm
                                </button>
                                {onOpenGrading && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenGrading(sub, matchedAssign)}
                                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                                  >
                                    {sub.status === 'graded' ? 'Sửa Điểm' : 'Chấm Bài'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right: Pending Homework to Do */}
                  <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Bài Tập Đang Chờ Nộp ({pendingAssignments.length})</span>
                      </span>
                    </div>

                    {pendingAssignments.length === 0 ? (
                      <div className="p-5 text-center bg-white rounded-xl border border-slate-200 text-xs text-emerald-700 space-y-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                        <p className="font-bold">Đã hoàn thành toàn bộ bài tập!</p>
                        <p className="text-[11px] text-slate-500">Học sinh không còn bài tập tồn đọng trên app.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {pendingAssignments.slice(0, 3).map((assign) => (
                          <div
                            key={assign.id}
                            className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <SkillBadge skill={assign.skill} size="sm" />
                                  <span className="text-xs font-bold text-slate-800 line-clamp-1">
                                    {assign.title}
                                  </span>
                                  {assign.isPersonalized && (
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                      Bài riêng
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500">
                                  Hạn chót: <strong className="font-mono text-slate-700">{formatDateTime(assign.deadline)}</strong>
                                </p>
                              </div>

                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                                {assign.timeLimitMinutes > 0 ? `${assign.timeLimitMinutes}p` : 'Không giới hạn'}
                              </span>
                            </div>

                            {assign.description && (
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {assign.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Personalized Homework Box */}
                <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Bài Tập Riêng Gần Đây</span>
                      </h4>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        {studentPersonalizedAssignments.length} bài
                      </span>
                    </div>

                    {studentPersonalizedAssignments.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-3 text-center bg-slate-50 rounded-2xl">
                        Chưa giao bài tập riêng nào cho học sinh này.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {studentPersonalizedAssignments.slice(0, 2).map((a) => (
                          <div key={a.id} className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center justify-between gap-2">
                            <div className="space-y-0.5 truncate">
                              <div className="flex items-center gap-1.5">
                                <SkillBadge skill={a.skill} />
                                <span className="text-xs font-bold text-slate-900 truncate">{a.title}</span>
                              </div>
                              {a.assignedReason && (
                                <p className="text-[10px] text-amber-900 truncate">🎯 Mục tiêu: {a.assignedReason}</p>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 shrink-0 font-mono">
                              Hạn: {a.deadline.split('T')[0]}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveProfileTab('personalized_assignments');
                      setIsAddingPersonalizedAssign(true);
                    }}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors mt-2 text-center cursor-pointer"
                  >
                    + Giao Bài Tập Riêng Mới
                  </button>
                </div>

                {/* Tutoring Sessions Box */}
                <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span>Lịch Học Kèm 1-1 Đã Lên Lịch</span>
                      </h4>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {studentTutoringSessions.length} buổi
                      </span>
                    </div>

                    {studentTutoringSessions.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-3 text-center bg-slate-50 rounded-2xl">
                        Chưa có lịch hẹn kèm 1-1 nào cho học sinh này.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {studentTutoringSessions.slice(0, 2).map((s) => (
                          <div key={s.id} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between gap-2">
                            <div className="space-y-0.5 truncate">
                              <span className="text-xs font-bold text-slate-900 truncate block">{s.title}</span>
                              <p className="text-[10px] text-indigo-900 truncate">
                                ⏰ {s.startTime} - {s.endTime} • {s.date}
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              s.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {s.status === 'completed' ? 'Đã học' : 'Sắp tới'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveProfileTab('tutoring_sessions');
                      setIsAddingTutoringSession(true);
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors mt-2 text-center cursor-pointer"
                  >
                    + Hẹn Buổi Học Kèm Mới
                  </button>
                </div>

              </div>

              {/* Teacher's Private Pedagogical Notes */}
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Ghi Chú Sư Phạm Của Giáo Viên (Private Pedagogical Notes)
                    </h3>
                  </div>
                  {isSavedNotes && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã lưu ghi chú
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  placeholder="Ghi chú về điểm yếu cần khắc phục, lộ trình tăng band riêng, tài liệu cần giao thêm cho học sinh này..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Ghi Chú Sư Phạm</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB: BÁO CÁO CHUYÊN CẦN & BỔ TRỢ CHI TIẾT ================= */}
          {activeProfileTab === 'attendance' && (
            <div className="space-y-5">
              {/* Header Card with summary */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <CalendarCheck className="w-5 h-5 text-emerald-600" />
                      <span>Báo Cáo Chi Tiết Chuyên Cần &amp; Học Bổ Trợ ({studentAttendance.length} buổi đã điểm danh)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Theo dõi quá trình chuyên cần, số buổi vắng, buổi học bổ trợ 1-1 và lộ trình nhập học của {student.name}.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingTutoringSession(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>+ Đặt Lịch Kèm Bổ Trợ 1-1</span>
                    </button>
                  </div>
                </div>

                {/* 4 Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <span className="text-[11px] text-emerald-700 font-medium block">Số buổi có mặt</span>
                    <span className="text-2xl font-black font-mono text-emerald-800">{presentCount}</span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Đúng giờ tham gia</span>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl">
                    <span className="text-[11px] text-rose-700 font-medium block">Số buổi vắng mặt</span>
                    <span className="text-2xl font-black font-mono text-rose-800">{totalAbsentCount}</span>
                    <span className="text-[10px] text-rose-600 block mt-0.5">{unexcusedCount} không phép • {excusedCount} có phép</span>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl">
                    <span className="text-[11px] text-amber-700 font-medium block">Số buổi đến muộn</span>
                    <span className="text-2xl font-black font-mono text-amber-800">{lateCount}</span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">Đi muộn &gt; 15 phút</span>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <span className="text-[11px] text-indigo-700 font-medium block">Số buổi kèm bổ trợ</span>
                    <span className="text-2xl font-black font-mono text-indigo-800">{tutoringCount}</span>
                    <span className="text-[10px] text-indigo-600 block mt-0.5">{completedTutoringSessions.length} hoàn thành • {upcomingTutoringSessions.length} sắp tới</span>
                  </div>
                </div>

                {/* Course Timeline Strip */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-slate-600 shrink-0" />
                    <div>
                      <span className="text-slate-500">Lộ trình học: </span>
                      <strong className="text-slate-900">{formatDateTime(joinedDateVal)}</strong>
                      <span className="text-slate-400 mx-1.5">➔</span>
                      <span className="text-slate-500">Dự kiến kết thúc: </span>
                      <strong className="text-slate-900">{formatDateTime(expectedEndDateVal)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      daysRemaining >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {daysRemaining >= 0 ? `Còn ${daysRemaining} ngày (${courseProgressPercent}% khóa học)` : 'Đã tốt nghiệp'}
                    </span>
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 mr-1">Bộ lọc:</span>
                  {[
                    { id: 'all', label: 'Tất cả', count: studentAttendance.length },
                    { id: 'present', label: 'Có mặt', count: presentCount },
                    { id: 'absent', label: 'Vắng mặt', count: totalAbsentCount },
                    { id: 'late', label: 'Đi muộn', count: lateCount },
                    { id: 'tutoring', label: 'Học kèm bổ trợ', count: tutoringCount },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setAttendanceFilterStatus(filter.id)}
                      className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        attendanceFilterStatus === filter.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                        attendanceFilterStatus === filter.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Attendance Table */}
              {attendanceFilterStatus !== 'tutoring' && (
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Nhật Ký Điểm Danh Từng Buổi Học</span>
                    </h4>
                    <span className="text-xs text-slate-500">
                      Tỷ lệ chuyên cần: <strong className="text-slate-900">{attendanceRate}%</strong>
                    </span>
                  </div>

                  {filteredStudentAttendance.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl">
                      <p className="text-xs text-slate-500 italic">Chưa có bản ghi điểm danh nào phù hợp bộ lọc cho học sinh này.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Ngày học</th>
                            <th className="py-2.5 px-3">Lớp học</th>
                            <th className="py-2.5 px-3 text-center">Trạng thái điểm danh</th>
                            <th className="py-2.5 px-3">Ghi chú của giáo viên</th>
                            <th className="py-2.5 px-3 text-right">Đề xuất bổ trợ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredStudentAttendance.map((rec) => (
                            <tr key={rec.id} className="hover:bg-slate-50/80">
                              <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                                {rec.date}
                              </td>
                              <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                {rec.classId && classes?.find((c) => c.id === rec.classId)?.name ? classes.find((c) => c.id === rec.classId)?.name : student.className}
                              </td>
                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  rec.status === 'present'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : rec.status === 'late'
                                    ? 'bg-amber-100 text-amber-800'
                                    : rec.status === 'excused'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {rec.status === 'present'
                                    ? '✅ Có mặt'
                                    : rec.status === 'late'
                                    ? '⏰ Đi muộn'
                                    : rec.status === 'excused'
                                    ? '📝 Vắng có phép'
                                    : '❌ Vắng không phép'}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-600 max-w-xs">
                                {rec.notes || <span className="text-slate-400 italic">Không có ghi chú</span>}
                              </td>
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                {rec.status === 'absent' || rec.status === 'excused' ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTutorTitle(`[Học Bù] Bổ trợ kiến thức buổi vắng ngày ${rec.date} - ${student.name}`);
                                      setTutorGoal(`Học bù nội dung buổi ${rec.date}`);
                                      setIsAddingTutoringSession(true);
                                    }}
                                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                                  >
                                    + Hẹn Học Bù
                                  </button>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">Đã tham gia</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tutoring Sessions Deep-Dive */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Danh Sách Các Buổi Kèm Bổ Trợ 1-1 Của Học Sinh ({studentTutoringSessions.length} buổi)</span>
                  </h4>

                  <button
                    type="button"
                    onClick={() => setIsAddingTutoringSession(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Thêm Buổi Học Kèm</span>
                  </button>
                </div>

                {studentTutoringSessions.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-500 italic">Chưa có buổi học kèm 1-1 nào cho học sinh này.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {studentTutoringSessions.map((session) => (
                      <div key={session.id} className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">{session.title}</span>
                            <span className="text-[11px] text-indigo-700 font-mono">
                              ⏰ {session.startTime} - {session.endTime} • 📅 {session.date}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            session.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : session.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {session.status === 'completed' ? '✅ Đã hoàn thành' : session.status === 'cancelled' ? '❌ Đã hủy' : '⏳ Sắp diễn ra'}
                          </span>
                        </div>

                        {session.tutoringGoal && (
                          <p className="text-[11px] text-slate-600">
                            <strong>Mục tiêu:</strong> {session.tutoringGoal}
                          </p>
                        )}

                        {session.roomOrLink && (
                          <p className="text-[11px] text-slate-500 font-mono truncate">
                            🔗 {session.roomOrLink}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-indigo-100/60">
                          <div className="flex items-center gap-1.5">
                            {session.status !== 'completed' && (
                              <button
                                type="button"
                                onClick={() => handleToggleTutoringStatus(session.id, 'completed')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Đánh dấu đã học
                              </button>
                            )}
                            {session.status === 'completed' && (
                              <button
                                type="button"
                                onClick={() => handleToggleTutoringStatus(session.id, 'upcoming')}
                                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Đánh dấu chưa học
                              </button>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteTutoringSession(session.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Xóa buổi học kèm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: BÀI TẬP RIÊNG & BỔ TRỢ CÁ NHÂN ================= */}
          {activeProfileTab === 'personalized_assignments' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Danh Sách Bài Tập Riêng Giao Cho Học Sinh ({studentPersonalizedAssignments.length} bài)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Các bài tập này được thiết kế riêng biệt để bù đắp kỹ năng còn yếu và chỉ hiển thị ở hồ sơ của học sinh này.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingPersonalizedAssign(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all self-start sm:self-auto cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                  <span>+ Giao Bài Tập Riêng Mới</span>
                </button>
              </div>

              {studentPersonalizedAssignments.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Chưa có bài tập riêng nào được giao
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Nếu học sinh cần bổ trợ thêm về ngữ pháp, từ vựng hay phát âm, bạn có thể click nút "+ Giao Bài Tập Riêng Mới" ở trên!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentPersonalizedAssignments.map((assign) => {
                    const remaining = getTimeRemaining(assign.deadline);
                    const matchedSub = studentSubmissions.find((s) => s.assignmentId === assign.id);

                    return (
                      <div
                        key={assign.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3 hover:border-amber-300 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <SkillBadge skill={assign.skill} />
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Bài Bổ Trợ Riêng
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                Hạn nộp: {formatDateTime(assign.deadline)}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-slate-900">
                              {assign.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {matchedSub ? (
                              matchedSub.overallBand ? (
                                <span className={`px-3 py-1 rounded-xl text-xs font-black font-mono ${getBandColorClass(matchedSub.overallBand)}`}>
                                  Đã chấm: Band {matchedSub.overallBand.toFixed(1)}
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-xl text-xs font-bold">
                                  ⏳ Đã nộp bài (Chờ chấm)
                                </span>
                              )
                            ) : (
                              <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                                remaining.isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {remaining.isOverdue ? '⚠️ Quá hạn' : 'Chưa nộp bài'}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePersonalizedAssignment(assign.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Xóa bài tập riêng này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {assign.assignedReason && (
                          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100 text-xs text-amber-900">
                            <strong>🎯 Mục tiêu bổ trợ:</strong> {assign.assignedReason}
                          </div>
                        )}

                        {assign.description && (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {assign.description}
                          </p>
                        )}

                        {matchedSub && onOpenGrading && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              Nộp lúc: {formatDateTime(matchedSub.submittedAt)}
                            </span>
                            <button
                              type="button"
                              onClick={() => onOpenGrading(matchedSub, assign)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                            >
                              {matchedSub.overallBand ? 'Xem & Sửa Điểm' : 'Chấm Bài Ngay'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: LỊCH HỌC KÈM 1-1 (ĐỒNG BỘ THỜI KHÓA BIỂU) ================= */}
          {activeProfileTab === 'tutoring_sessions' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Lịch Hẹn Buổi Học Kèm 1-1 ({studentTutoringSessions.length} buổi)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đã đồng bộ tự động với <strong>Thời Khóa Biểu Của Tôi</strong> (Hiển thị thẻ riêng trên Lịch Tháng &amp; Lịch Học Viên).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingTutoringSession(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all self-start sm:self-auto cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>+ Hẹn Buổi Kèm 1-1 Mới</span>
                </button>
              </div>

              {studentTutoringSessions.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    Chưa có lịch hẹn kèm 1-1 nào
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Bạn có thể tạo buổi phụ đạo 1-1 để kèm riêng phát âm, sửa bài Writing hoặc củng cố kiến thức cho học sinh.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentTutoringSessions.map((s) => (
                    <div
                      key={s.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3 hover:border-indigo-300 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-200">
                              ⭐ Kèm 1-1 ({s.skillFocus})
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              📅 {s.date} (⏰ {s.startTime} - {s.endTime})
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">
                            {s.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={s.status}
                            onChange={(e) => handleToggleTutoringStatus(s.id, e.target.value as any)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer ${
                              s.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : s.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-blue-50 text-blue-800 border-blue-300'
                            }`}
                          >
                            <option value="upcoming">⏳ Sắp diễn ra</option>
                            <option value="completed">✅ Đã hoàn thành</option>
                            <option value="cancelled">❌ Đã hủy</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteTutoringSession(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Xóa lịch hẹn này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Details & Link */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <strong className="text-slate-700">🎯 Mục tiêu:</strong>{' '}
                          <span className="text-slate-600">{s.tutoringGoal || s.topic}</span>
                        </div>
                        <div>
                          <strong className="text-slate-700">📍 Địa điểm/Link:</strong>{' '}
                          <span className="text-blue-600 font-medium">{s.roomOrLink || 'Chưa cập nhật'}</span>
                        </div>
                      </div>

                      {s.notes && (
                        <p className="text-xs text-slate-500 italic">
                          💡 Dặn dò: {s.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: ĐIỂM TRÊN LỚP ================= */}
          {activeProfileTab === 'in_class' && (
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Kết Quả Hoạt Động &amp; Kiểm Tra Trên Lớp ({filteredStudentInClassEntries.length} bài)
                  </h3>
                </div>
              </div>

              {filteredStudentInClassEntries.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6 bg-slate-50/60 rounded-2xl border border-slate-100">
                  Chưa có dữ liệu bài tập hoặc mini-test nào phù hợp bộ lọc cho học sinh này.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Bài tập &amp; Kỹ năng</th>
                        <th className="py-2.5 px-3">Ngày &amp; Buổi</th>
                        <th className="py-2.5 px-3">Trạng thái</th>
                        <th className="py-2.5 px-3">Điểm số</th>
                        <th className="py-2.5 px-3">Nhận xét trực tiếp của GV</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudentInClassEntries.map((rec) => (
                        <tr key={rec.activityId} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <SkillBadge skill={rec.skill} />
                                <span className="font-semibold text-slate-800 line-clamp-1">
                                  {rec.title}
                                </span>
                              </div>
                              {rec.topic && (
                                <p className="text-[10px] text-slate-400 line-clamp-1">
                                  Yêu cầu: {rec.topic}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                            <div className="font-medium text-slate-700">{rec.date}</div>
                            {rec.sessionNumber && (
                              <span className="text-[10px] text-indigo-600 font-semibold">
                                Buổi {rec.sessionNumber}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {rec.entry.status === 'completed' ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Đã hoàn thành
                              </span>
                            ) : rec.entry.status === 'absent' ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                Vắng mặt
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                                Chưa làm
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            {rec.entry.status === 'absent' ? (
                              <span className="text-slate-400 font-mono italic">—</span>
                            ) : rec.scoreType === 'band' ? (
                              <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${getBandColorClass(rec.entry.score)}`}>
                                Band {rec.entry.score.toFixed(1)}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                                {rec.entry.score} <span className="text-[10px] text-slate-400 font-normal">/ {rec.maxScore}đ</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-slate-600 max-w-xs">
                            {rec.entry.notes ? (
                              <span className="leading-relaxed">{rec.entry.notes}</span>
                            ) : (
                              <span className="text-slate-400 italic">Không có nhận xét</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 5: BÀI TEST (MINI, MID, FINAL) ================= */}
          {activeProfileTab === 'tests' && (
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Kết Quả Các Bài Test Định Kỳ &amp; Thi Thử ({filteredStudentTestEntries.length} kỳ thi)
                  </h3>
                </div>
              </div>

              {filteredStudentTestEntries.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6 bg-slate-50/60 rounded-2xl border border-slate-100">
                  Chưa có dữ liệu bài test nào (Mini-Test, Giữa khóa hoặc Cuối khóa) cho học sinh này.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Kỳ thi / Bài Test</th>
                        <th className="py-2.5 px-3 text-center">Ngày thi</th>
                        <th className="py-2.5 px-2 text-center">Thang điểm</th>
                        <th className="py-2.5 px-2 text-center">Chi tiết kỹ năng</th>
                        <th className="py-2.5 px-3 text-center bg-blue-50 text-blue-900">Điểm Tổng (Overall)</th>
                        <th className="py-2.5 px-3 text-center">Mục Tiêu</th>
                        <th className="py-2.5 px-3">Đánh Giá &amp; Lời Khuyên</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudentTestEntries.map((item) => {
                        const typeLabel =
                          item.type === 'mini_test'
                            ? '⚡ Mini-Test'
                            : item.type === 'mid_test'
                            ? '🏆 Mid-Term'
                            : '🎓 Final Mock';

                        const isBand = item.scoreScale === 'ielts_band';
                        const max = item.maxScore || (isBand ? 9.0 : 10);
                        const unit = item.scoreUnit || (isBand ? 'Band' : 'điểm');

                        return (
                          <tr key={item.testId} className="hover:bg-slate-50/80">
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-800 line-clamp-1">{item.title}</div>
                              <span className="text-[10px] font-bold text-slate-500">{typeLabel} • {item.className}</span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 text-center whitespace-nowrap">{item.date}</td>
                            <td className="py-3 px-2 text-center whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                                {isBand ? 'Band 0-9.0' : `Thang ${max} ${unit}`}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap text-[11px] font-mono font-bold text-slate-700">
                                {item.result.scores.listening !== undefined && (
                                  <span title="Listening">L: {item.result.scores.listening}</span>
                                )}
                                {item.result.scores.reading !== undefined && (
                                  <span title="Reading">R: {item.result.scores.reading}</span>
                                )}
                                {item.result.scores.writing !== undefined && (
                                  <span title="Writing">W: {item.result.scores.writing}</span>
                                )}
                                {item.result.scores.speaking !== undefined && (
                                  <span title="Speaking">S: {item.result.scores.speaking}</span>
                                )}
                                {item.result.scores.grammar !== undefined && (
                                  <span title="Grammar">Gr: {item.result.scores.grammar}</span>
                                )}
                                {item.result.scores.vocabulary !== undefined && (
                                  <span title="Vocabulary">Voc: {item.result.scores.vocabulary}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center bg-blue-50/50 whitespace-nowrap">
                              {isBand ? (
                                <span className={`px-2.5 py-0.5 rounded-lg font-mono font-black text-xs ${getBandColorClass(item.result.scores.overall)}`}>
                                  Band {item.result.scores.overall.toFixed(1)}
                                </span>
                              ) : (
                                <div>
                                  <span className="px-2.5 py-0.5 rounded-lg font-mono font-black text-xs bg-blue-600 text-white">
                                    {item.result.scores.overall} / {max} {unit}
                                  </span>
                                  {item.result.scores.bandEquivalent && (
                                    <span className="text-[10px] text-slate-500 block font-normal mt-0.5">
                                      ~ Band {item.result.scores.bandEquivalent}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              {item.result.targetBand ? (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.result.targetAchieved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {item.result.targetAchieved ? '✅ Đạt' : `Target ${item.result.targetBand}`}
                                </span>
                              ) : item.result.targetScore ? (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  item.result.targetAchieved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {item.result.targetAchieved ? '✅ Đạt' : `Target ${item.result.targetScore}`}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-600 max-w-xs">
                              {item.result.strengths && (
                                <p className="text-[11px] text-emerald-700"><strong className="font-semibold">Mạnh:</strong> {item.result.strengths}</p>
                              )}
                              {item.result.improvements && (
                                <p className="text-[11px] text-amber-700"><strong className="font-semibold">Rèn thêm:</strong> {item.result.improvements}</p>
                              )}
                              {item.result.notes && (
                                <p className="text-[11px] italic text-slate-600">"{item.result.notes}"</p>
                              )}
                              {!item.result.strengths && !item.result.improvements && !item.result.notes && (
                                <span className="text-slate-400 italic text-[11px]">Không có ghi chú</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 6: KẾT QUẢ BÀI TẬP TRÊN APP ================= */}
          {activeProfileTab === 'submissions' && (
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-5">
              
              {/* Header & Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Kết Quả Làm Bài Tập Trên App</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {filteredStudentSubmissions.length} bài
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Theo dõi toàn bộ bài làm Writing, Speaking, Reading, Listening và Từ vựng của học sinh trên ứng dụng.
                  </p>
                </div>

                {/* View Mode Toggle & Actions */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSubmissionViewMode('cards')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        submissionViewMode === 'cards'
                          ? 'bg-white text-blue-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Dạng Thẻ Chi Tiết
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmissionViewMode('table')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        submissionViewMode === 'table'
                          ? 'bg-white text-blue-600 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Dạng Bảng
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Summary Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">Tổng lượt nộp</span>
                  <span className="text-lg font-black font-mono text-slate-900">{studentSubmissions.length}</span>
                </div>
                <div>
                  <span className="text-[11px] text-amber-800 font-medium block">Điểm Band TB</span>
                  <span className="text-lg font-black font-mono text-amber-900">
                    {avgHomeworkBand ? `Band ${avgHomeworkBand.toFixed(1)}` : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-800 font-medium block">Đã chấm điểm</span>
                  <span className="text-lg font-black font-mono text-emerald-900">{gradedSubs.length}</span>
                </div>
                <div>
                  <span className="text-[11px] text-blue-800 font-medium block">Chờ chấm</span>
                  <span className="text-lg font-black font-mono text-blue-900">
                    {studentSubmissions.filter((s) => s.status !== 'graded').length}
                  </span>
                </div>
              </div>

              {/* Filters Bar: Skill & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {/* Skill Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500 mr-1">Kỹ năng:</span>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'writing', label: 'Writing' },
                    { id: 'speaking', label: 'Speaking' },
                    { id: 'reading', label: 'Reading' },
                    { id: 'listening', label: 'Listening' },
                    { id: 'vocabulary', label: 'Từ vựng' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setSubmissionSkillFilter(filter.id)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        submissionSkillFilter === filter.id
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 mr-1">Trạng thái:</span>
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'graded', label: 'Đã chấm' },
                    { id: 'pending', label: 'Chờ chấm' },
                  ].map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => setSubmissionStatusFilter(status.id)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        submissionStatusFilter === status.id
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submissions List / Grid */}
              {filteredStudentSubmissions.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">
                    Không tìm thấy bài tập nào phù hợp với bộ lọc.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Học sinh chưa nộp bài tập theo kỹ năng hoặc trạng thái đã chọn.
                  </p>
                </div>
              ) : submissionViewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStudentSubmissions.map((sub) => {
                    const matchedAssign = localAssignments.find((a) => a.id === sub.assignmentId);
                    return (
                      <div
                        key={sub.id}
                        className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          {/* Top row: Skill, Personalized, Band Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <SkillBadge skill={sub.assignmentSkill} size="sm" />
                              {matchedAssign?.isPersonalized && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                  ⭐ Bài riêng
                                </span>
                              )}
                            </div>

                            <div className="shrink-0">
                              {sub.overallBand ? (
                                <span className={`px-2.5 py-1 rounded-xl font-mono font-black text-xs ${getBandColorClass(sub.overallBand)} shadow-2xs`}>
                                  Band {sub.overallBand.toFixed(1)}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  Chờ chấm
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Title */}
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                            {sub.assignmentTitle}
                          </h4>

                          {/* Timing info */}
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                            <span>📅 {formatDateTime(sub.submittedAt)}</span>
                            <span>⏱️ {formatSecondsToTime(sub.timeSpentSeconds)} {sub.timeLimitMinutes > 0 ? `/${sub.timeLimitMinutes}p` : ''}</span>
                          </div>

                          {/* Criteria Breakdown if Graded */}
                          {sub.criteriaScores && Object.keys(sub.criteriaScores).length > 0 && (
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Điểm thành phần tiêu chí:
                              </span>
                              <div className="grid grid-cols-4 gap-1 text-center">
                                {Object.entries(sub.criteriaScores).map(([key, val]) => (
                                  <div key={key} className="bg-white p-1 rounded-lg border border-slate-100">
                                    <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">{key}</span>
                                    <span className="text-xs font-black font-mono text-slate-800">{typeof val === 'number' ? val.toFixed(1) : val}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Teacher Feedback snippet */}
                          {sub.teacherFeedback ? (
                            <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-slate-700 space-y-1">
                              <strong className="text-blue-900 block font-bold">Nhận xét của Giáo Viên:</strong>
                              <p className="line-clamp-2 italic">"{sub.teacherFeedback}"</p>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">Chưa có nhận xét chi tiết của giáo viên.</p>
                          )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setViewingFeedbackSubmission({ submission: sub, assignment: matchedAssign })}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                          >
                            Xem Chi Tiết Bài Làm
                          </button>
                          {onOpenGrading && (
                            <button
                              type="button"
                              onClick={() => onOpenGrading(sub, matchedAssign)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              {sub.status === 'graded' ? 'Sửa Điểm' : 'Chấm Bài'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Bài tập &amp; Kỹ năng</th>
                        <th className="py-2.5 px-3">Thời gian nộp</th>
                        <th className="py-2.5 px-3">Thời lượng làm</th>
                        <th className="py-2.5 px-3">Điểm Band</th>
                        <th className="py-2.5 px-3">Nhận xét của GV</th>
                        <th className="py-2.5 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudentSubmissions.map((sub) => {
                        const matchedAssign = localAssignments.find((a) => a.id === sub.assignmentId);

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <SkillBadge skill={sub.assignmentSkill} />
                                <div>
                                  <span className="font-semibold text-slate-800 line-clamp-1">
                                    {sub.assignmentTitle}
                                  </span>
                                  {matchedAssign?.isPersonalized && (
                                    <span className="text-[10px] text-amber-700 font-bold">
                                      ⭐ Bài riêng
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                              {formatDateTime(sub.submittedAt)}
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-mono whitespace-nowrap">
                              {formatSecondsToTime(sub.timeSpentSeconds)}
                              {sub.timeLimitMinutes > 0 && (
                                <span className="text-[10px] text-slate-400 ml-1">
                                  / {sub.timeLimitMinutes}p
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {sub.overallBand ? (
                                <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${getBandColorClass(sub.overallBand)}`}>
                                  Band {sub.overallBand.toFixed(1)}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  Chờ chấm
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-600 line-clamp-2 max-w-xs">
                              {sub.teacherFeedback || '—'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setViewingFeedbackSubmission({ submission: sub, assignment: matchedAssign })}
                                  className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Chi tiết
                                </button>
                                {onOpenGrading && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenGrading(sub, matchedAssign)}
                                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    {sub.status === 'graded' ? 'Sửa' : 'Chấm'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          </div>
        </div>
      </div>

      {/* ================= SUB-MODAL: XEM CHI TIẾT BÀI LÀM & NHẬN XÉT CỦA HỌC SINH ================= */}
      {viewingFeedbackSubmission && (
        <StudentFeedbackViewModal
          isOpen={true}
          onClose={() => setViewingFeedbackSubmission(null)}
          submission={viewingFeedbackSubmission.submission}
          assignment={viewingFeedbackSubmission.assignment}
        />
      )}
    </div>
  );
};
