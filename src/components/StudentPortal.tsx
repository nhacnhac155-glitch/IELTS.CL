import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  PenTool, 
  Mic, 
  Headphones, 
  Clock, 
  Calendar, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  FileText, 
  ChevronRight, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Eye,
  CalendarDays,
  ExternalLink,
  MapPin,
  Check,
  GraduationCap,
  Camera,
  Upload
} from 'lucide-react';
import { Assignment, ClassScheduleSession, Student, Submission } from '../types';
import { formatDateTime, formatSecondsToTime, getBandColorClass, getTimeRemaining } from '../utils/formatters';
import { SkillBadge } from './SkillBadge';
import { StorageService } from '../services/storage';
import { StudentScheduleCalendar } from './StudentScheduleCalendar';

interface StudentPortalProps {
  student: Student;
  assignments: Assignment[];
  submissions: Submission[];
  onStartAssignment: (assignment: Assignment) => void;
  onViewSubmissionDetail: (submission: Submission, assignment?: Assignment) => void;
  onUpdateAvatar?: (newAvatar: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  assignments,
  submissions,
  onStartAssignment,
  onViewSubmissionDetail,
  onUpdateAvatar,
}) => {
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<'assignments' | 'results' | 'schedule'>('assignments');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateAvatar) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          onUpdateAvatar(base64Url);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'progress' | 'schedule' | 'in_class' | 'tests'>('pending');
  const [scheduleViewMode, setScheduleViewMode] = useState<'calendar' | 'list'>('calendar');

  // Load In-class results
  const allInClass = StorageService.getInClassResults();
  const studentInClassEntries = allInClass
    .map((r) => {
      const entry = r.entries.find((e) => e.studentId === student.id);
      if (!entry) return null;
      return {
        activityId: r.id,
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
      title: string;
      date: string;
      skill: any;
      scoreType: 'band' | 'points' | 'percentage';
      maxScore: number;
      sessionNumber?: number;
      topic?: string;
      entry: NonNullable<(typeof allInClass)[0]['entries'][0]>;
    }[];

  // Load Test records
  const allTests = StorageService.getTestRecords();
  const studentTestEntries = allTests
    .map((t) => {
      const res = t.results.find((r) => r.studentId === student.id);
      if (!res) return null;
      return {
        testId: t.id,
        title: t.title,
        type: t.type,
        date: t.date,
        className: t.className,
        description: t.description,
        generalNotes: t.generalNotes,
        result: res,
      };
    })
    .filter(Boolean) as {
      testId: string;
      title: string;
      type: 'mini_test' | 'mid_test' | 'final_test';
      date: string;
      className: string;
      description?: string;
      generalNotes?: string;
      result: NonNullable<(typeof allTests)[0]['results'][0]>;
    }[];

  // Load class schedules + 1-on-1 tutoring sessions for THIS student
  const allSchedules = StorageService.getSchedules();
  const classSchedules = allSchedules
    .filter((s) => {
      if (s.isIndividualTutoring) {
        return s.studentId === student.id || s.title.includes(student.name);
      }
      return s.classId === student.classId || s.className.toLowerCase() === student.className.toLowerCase();
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.sessionNumber - b.sessionNumber);
  
  const upcomingClassSchedules = classSchedules.filter((s) => s.status === 'upcoming');

  // Filter assignments for this student:
  // Show if:
  // 1) Personalized assignment specifically for this student
  // 2) General class assignment (not personalized) matching student's class
  const classAssignments = assignments.filter((a) => {
    if (a.isPersonalized || a.assignedStudentId) {
      return a.assignedStudentId === student.id;
    }
    return a.classId === student.classId || a.classId === 'all';
  });

  // Student submissions
  const studentSubs = submissions.filter((s) => s.studentId === student.id);
  const submittedAssignmentIds = new Set(studentSubs.map((s) => s.assignmentId));

  // Pending assignments to do
  const pendingAssignments = classAssignments.filter((a) => !submittedAssignmentIds.has(a.id));

  // Completed assignments
  const completedSubmissions = studentSubs.map((sub) => {
    const matchedAssign = assignments.find((a) => a.id === sub.assignmentId);
    return { submission: sub, assignment: matchedAssign };
  });

  return (
    <div className="space-y-6">
      
      {/* Student Welcome & Band Hero Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-900/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFile}
            />
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Bấm để tải ảnh đại diện mới từ máy tính của bạn"
            >
              <img
                src={student.avatar}
                alt={student.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-blue-400/40 shadow-lg group-hover:border-blue-400 transition-all"
              />
              <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
                <span className="text-[9px] text-white font-medium mt-0.5">Đổi ảnh</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Chào {student.name}! 👋
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {student.className}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">
                Luyện tập đều đặn 4 kỹ năng để đạt mục tiêu Target Band {student.targetBand.toFixed(1)}!
              </p>
            </div>
          </div>

          {/* Quick Band Summary */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15">
            <div className="text-center pr-4 border-r border-white/20">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">
                Overall Band
              </span>
              <span className="text-3xl font-black text-amber-300 font-mono">
                {student.currentEstimatedBand.toFixed(1)}
              </span>
            </div>
            <div className="text-center pl-2">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">
                Mục Tiêu
              </span>
              <span className="text-3xl font-black text-white font-mono">
                {student.targetBand.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Skill Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-6 border-t border-white/10">
          {[
            { label: 'Reading', score: student.skillScores.reading, icon: BookOpen, color: 'text-blue-400' },
            { label: 'Listening', score: student.skillScores.listening, icon: Headphones, color: 'text-sky-400' },
            { label: 'Writing', score: student.skillScores.writing, icon: PenTool, color: 'text-amber-400' },
            { label: 'Speaking', score: student.skillScores.speaking, icon: Mic, color: 'text-emerald-400' },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-xs font-medium text-slate-300">{item.label}</span>
              </div>
              <span className="text-sm font-bold font-mono text-white">
                Band {item.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Bài Tập Cần Làm</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-bold">
            {pendingAssignments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'completed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Bài Đã Nộp & Điểm Số</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-bold">
            {completedSubmissions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'progress'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tiến Độ Học Tập</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'schedule'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Thời Khóa Biểu Lớp</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800 font-bold">
            {classSchedules.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('in_class')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'in_class'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Kết Quả Trên Lớp</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 font-bold">
            {studentInClassEntries.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tests')}
          className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'tests'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Bài Test (Mini/Mid/Final)</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">
            {studentTestEntries.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Pending Assignments */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingAssignments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Bạn đã hoàn thành tất cả bài tập! 🎉
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tuyệt vời! Hiện không còn bài tập nào chưa nộp. Giáo viên sẽ giao bài tập mới sớm.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingAssignments.map((assign) => {
                const remaining = getTimeRemaining(assign.deadline);
                const classBadge = assign.classId === 'all' 
                  ? 'ALL' 
                  : (assign.className?.includes('Intensive') ? 'INT-88' : assign.className?.includes('Foundation') ? 'FND-12' : assign.className?.includes('Master') ? 'MAS-75' : 'LỚP HỌC');

                return (
                  <div
                    key={assign.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <SkillBadge skill={assign.skill} />
                          {assign.isPersonalized ? (
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold text-xs flex items-center gap-1 shadow-2xs">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              BÀI TẬP RIÊNG (BỔ TRỢ)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-md font-bold text-xs uppercase tracking-wide">
                              {classBadge}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          remaining.isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : remaining.isUrgent
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {remaining.text}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {assign.title}
                        </h3>
                        {assign.assignedReason && (
                          <div className="mt-1 px-2.5 py-1 bg-amber-50 rounded-lg border border-amber-200/60 text-[11px] text-amber-900 font-medium">
                            🎯 Mục tiêu bổ trợ: {assign.assignedReason}
                          </div>
                        )}
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {assign.description}
                        </p>
                      </div>

                      {/* Time Limit & Target Band details */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{assign.timeLimitMinutes > 0 ? `${assign.timeLimitMinutes} phút` : 'Không giới hạn'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500" title={`Hạn nộp: ${formatDateTime(assign.deadline)}`}>
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Hạn: {formatDateTime(assign.deadline)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onStartAssignment(assign)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-98 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Bắt Đầu Làm Bài Ngay</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Completed Submissions */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedSubmissions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">Bạn chưa nộp bài tập nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedSubmissions.map(({ submission, assignment }) => {
                const isGraded = submission.status === 'graded';
                return (
                  <div
                    key={submission.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <SkillBadge skill={submission.assignmentSkill} />
                        <h4 className="text-sm font-bold text-slate-900">
                          {submission.assignmentTitle}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-500">
                        Nộp lúc: {formatDateTime(submission.submittedAt)} • Thời gian làm: {formatSecondsToTime(submission.timeSpentSeconds)}
                        {submission.wordCount ? ` • ${submission.wordCount} từ` : ''}
                      </p>

                      {submission.teacherFeedback && (
                        <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2 line-clamp-2">
                          💬 Giáo viên: "{submission.teacherFeedback}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isGraded && submission.overallBand ? (
                        <div className="text-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                          <span className="text-[10px] font-bold uppercase text-blue-600 block">Band Điểm</span>
                          <span className="text-xl font-black text-blue-950 font-mono">
                            {submission.overallBand.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Đang chờ GV chấm
                        </span>
                      )}

                      {isGraded && (
                        <button
                          type="button"
                          onClick={() => onViewSubmissionDetail(submission, assignment)}
                          className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Xem Nhận Xét</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Progress & Skill Stats */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 4-Skill Bars */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Thang Điểm 4 Kỹ Năng Hiện Tại
              </h3>

              <div className="space-y-3.5">
                {[
                  { name: 'Reading', score: student.skillScores.reading, color: 'bg-blue-600' },
                  { name: 'Listening', score: student.skillScores.listening, color: 'bg-sky-600' },
                  { name: 'Writing', score: student.skillScores.writing, color: 'bg-amber-600' },
                  { name: 'Speaking', score: student.skillScores.speaking, color: 'bg-emerald-600' },
                ].map((sk) => (
                  <div key={sk.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span>{sk.name}</span>
                      <span className="font-mono">{sk.score.toFixed(1)} / 9.0</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sk.color}`}
                        style={{ width: `${(sk.score / 9.0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Punctuality and Habits */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Chỉ Số Chăm Chỉ & Nộp Bài
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500">Tổng bài nộp</p>
                  <p className="text-xl font-bold text-slate-900">{student.totalSubmissions}</p>
                </div>
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-700">Nộp đúng hạn</p>
                  <p className="text-xl font-bold text-emerald-800">{student.onTimeSubmissions}</p>
                </div>
              </div>

              {student.notes && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold uppercase text-amber-800">
                    💡 Lời khuyên từ Giáo viên:
                  </span>
                  <p className="text-xs text-amber-950 italic">
                    "{student.notes}"
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Tab 4: Class Timetable & Lesson Plan */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                Thời Khóa Biểu Lớp: {student.className}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem kế hoạch từng buổi học theo lịch tháng, nội dung trọng tâm, bài tập và slide bài giảng
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setScheduleViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    scheduleViewMode === 'calendar'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Xem dạng Lịch Tháng"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Lịch tháng</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    scheduleViewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Xem dạng Danh Sách"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Danh sách</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold rounded-xl">
                  {upcomingClassSchedules.length} buổi sắp tới
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold rounded-xl">
                  {classSchedules.filter((s) => s.status === 'completed').length} buổi đã học
                </span>
              </div>
            </div>
          </div>

          {classSchedules.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Lớp học chưa có lịch buổi học nào
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Giáo viên sẽ sớm cập nhật thời khóa biểu và lộ trình bài học cho lớp của bạn!
              </p>
            </div>
          ) : scheduleViewMode === 'calendar' ? (
            <StudentScheduleCalendar
              className={student.className}
              schedules={classSchedules}
            />
          ) : (
            <div className="space-y-4">
              {classSchedules.map((session) => {
                const dateObj = new Date(session.date);
                const dayOfWeekStr = isNaN(dateObj.getTime())
                  ? 'Ngày học'
                  : `Thứ ${dateObj.getDay() === 0 ? 'Chủ Nhật' : dateObj.getDay() + 1}`;
                const formattedDate = isNaN(dateObj.getTime())
                  ? session.date
                  : `${dayOfWeekStr}, ${dateObj.toLocaleDateString('vi-VN')}`;

                return (
                  <div
                    key={session.id}
                    className={`bg-white rounded-3xl p-6 border transition-all shadow-2xs ${
                      session.status === 'completed'
                        ? 'border-emerald-200/80 bg-slate-50/30'
                        : session.status === 'cancelled'
                        ? 'border-rose-200/80 opacity-75'
                        : 'border-slate-200/90'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        
                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg shadow-2xs">
                            Buổi {session.sessionNumber}
                          </span>

                          {session.skillFocus && (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 font-bold text-xs rounded-lg">
                              🎯 {session.skillFocus}
                            </span>
                          )}

                          <span
                            className={`px-2.5 py-1 font-bold text-xs rounded-lg ${
                              session.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : session.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {session.status === 'completed' ? '✓ Đã hoàn thành' :
                             session.status === 'cancelled' ? '✕ Đã nghỉ' : '⏳ Sắp diễn ra'}
                          </span>
                        </div>

                        {/* Title & DateTime */}
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">
                            {session.title}
                          </h4>
                          
                          <div className="flex items-center gap-4 text-xs text-slate-600 font-medium mt-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              <span>{formattedDate}</span>
                            </div>

                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                              <Clock className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{session.startTime} - {session.endTime}</span>
                            </div>

                            {session.roomOrLink && (
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                <span>{session.roomOrLink}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content box */}
                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-xs text-slate-700 space-y-2.5">
                          <div>
                            <span className="font-bold text-slate-900 block mb-1">
                              📖 Nội dung buổi học:
                            </span>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                              {session.topic}
                            </p>
                          </div>

                          {session.homeworkSummary && (
                            <div className="pt-2 border-t border-slate-200/60 flex items-start gap-2">
                              <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-amber-900">Bài tập về nhà: </span>
                                <span className="text-slate-700">{session.homeworkSummary}</span>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Materials Action */}
                      {session.materialsUrl && (
                        <div className="shrink-0 pt-2 lg:pt-0">
                          <a
                            href={session.materialsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Mở Slide & Tài Liệu</span>
                          </a>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Tab 5: In-Class Results & Exercises */}
      {activeTab === 'in_class' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Kết Quả Luyện Tập & Bài Tập Trên Lớp
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Điểm số, mini-test và nhận xét trực tiếp của giáo viên sau các buổi học trên lớp
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold rounded-xl">
                {studentInClassEntries.length} hoạt động được ghi nhận
              </span>
            </div>
          </div>

          {studentInClassEntries.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Chưa có kết quả bài tập trên lớp
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Khi thầy cô tổ chức làm mini-test hoặc bài tập trên lớp và ghi nhận điểm, kết quả chi tiết kèm lời nhận xét sẽ hiển thị tại đây!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentInClassEntries.map((rec) => (
                <div
                  key={rec.activityId}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3.5 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <SkillBadge skill={rec.skill} />
                        {rec.sessionNumber && (
                          <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded-md">
                            Buổi {rec.sessionNumber}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-medium">
                          {rec.date}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {rec.title}
                      </h4>
                    </div>

                    {/* Score Badge */}
                    <div className="shrink-0 text-right">
                      {rec.entry.status === 'absent' ? (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl">
                          Vắng mặt
                        </span>
                      ) : rec.scoreType === 'band' ? (
                        <div className="text-center bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                          <span className="text-[9px] font-bold uppercase text-blue-600 block">Band Điểm</span>
                          <span className="text-lg font-black text-blue-900 font-mono">
                            {rec.entry.score.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-center bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                          <span className="text-[9px] font-bold uppercase text-slate-600 block">Điểm số</span>
                          <span className="text-base font-black text-slate-900 font-mono">
                            {rec.entry.score} / {rec.maxScore}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {rec.topic && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      🎯 <strong className="text-slate-700 font-semibold">Chủ đề:</strong> {rec.topic}
                    </p>
                  )}

                  {/* Teacher Feedback */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Nhận xét trực tiếp của Giáo Viên:
                    </span>
                    <p className="text-xs text-amber-950 italic leading-relaxed">
                      {rec.entry.notes ? `"${rec.entry.notes}"` : 'Thực hiện tốt, tiếp tục phát huy!'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Test Results (Mini Test, Mid-Term, Final Mock Test) */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                Kết Quả Các Kỳ Thi &amp; Bài Test Định Kỳ (IELTS 4 Kỹ Năng)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Điểm chi tiết Nghe - Đọc - Viết - Nói, Overall Band, so sánh mục tiêu Target và lời khuyên của giáo viên
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl">
                {studentTestEntries.length} bài thi được ghi nhận
              </span>
            </div>
          </div>

          {studentTestEntries.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Chưa có dữ liệu bài test nào
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Khi thầy cô tổ chức thi Mini-test, Mid-term hoặc Final Mock test và nhập điểm, bảng điểm 4 kỹ năng và nhận xét sẽ hiển thị tại đây!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {studentTestEntries.map((item) => {
                const typeBadge =
                  item.type === 'mini_test' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      ⚡ Mini-Test Định Kỳ
                    </span>
                  ) : item.type === 'mid_test' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      🏆 Mid-Term Giữa Khóa
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      🎓 Final Mock Test Cuối Khóa
                    </span>
                  );

                return (
                  <div
                    key={item.testId}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4 hover:border-blue-300 transition-all"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {typeBadge}
                          <span className="text-xs text-slate-400 font-medium">
                            Ngày thi: {item.date}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-slate-500">{item.description}</p>
                        )}
                      </div>

                      {/* Overall Band Big Badge */}
                      <div className="text-center bg-blue-50 px-4 py-2.5 rounded-2xl border border-blue-100 shrink-0 sm:self-start">
                        <span className="text-[10px] font-bold uppercase text-blue-600 block">
                          IELTS OVERALL
                        </span>
                        <span className="text-2xl font-black text-blue-900 font-mono">
                          Band {item.result.scores.overall.toFixed(1)}
                        </span>
                        {item.result.targetBand && (
                          <div className="mt-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.result.targetAchieved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.result.targetAchieved ? '✅ Đạt Target' : `Target: Band ${item.result.targetBand}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 4 Skills Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <span className="text-[11px] font-semibold text-slate-500 block">🎧 Listening</span>
                        <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                          Band {item.result.scores.listening !== undefined ? item.result.scores.listening.toFixed(1) : '—'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <span className="text-[11px] font-semibold text-slate-500 block">📖 Reading</span>
                        <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                          Band {item.result.scores.reading !== undefined ? item.result.scores.reading.toFixed(1) : '—'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <span className="text-[11px] font-semibold text-slate-500 block">✍️ Writing</span>
                        <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                          Band {item.result.scores.writing !== undefined ? item.result.scores.writing.toFixed(1) : '—'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <span className="text-[11px] font-semibold text-slate-500 block">🗣️ Speaking</span>
                        <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                          Band {item.result.scores.speaking !== undefined ? item.result.scores.speaking.toFixed(1) : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Feedback & Teacher Advice */}
                    <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        Đánh Giá Năng Lực &amp; Lời Khuyên Của Giáo Viên:
                      </span>
                      {item.result.strengths && (
                        <p className="text-xs text-emerald-900">
                          <strong className="font-bold">🌟 Điểm mạnh:</strong> {item.result.strengths}
                        </p>
                      )}
                      {item.result.improvements && (
                        <p className="text-xs text-amber-900">
                          <strong className="font-bold">💡 Cần rèn thêm:</strong> {item.result.improvements}
                        </p>
                      )}
                      {item.result.notes && (
                        <p className="text-xs text-slate-700 italic">
                          "{item.result.notes}"
                        </p>
                      )}
                      {!item.result.strengths && !item.result.improvements && !item.result.notes && (
                        <p className="text-xs text-slate-500 italic">
                          Bài làm đạt yêu cầu, tiếp tục duy trì lộ trình luyện tập!
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
