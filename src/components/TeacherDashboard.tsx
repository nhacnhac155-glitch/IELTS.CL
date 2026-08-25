import React, { useState } from 'react';
import { 
  BookOpen, 
  PenTool, 
  Mic, 
  Headphones, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  Search, 
  Filter, 
  Award, 
  FileText, 
  ChevronRight, 
  TrendingUp, 
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  UserCheck,
  UserPlus,
  Trash2,
  Edit3,
  LayoutGrid,
  ClipboardCheck,
  CalendarCheck,
  Check,
  X,
  GraduationCap,
  Save,
  Copy,
  History,
  ArrowRight,
  ArrowUpDown,
  MoreVertical,
  KeyRound,
  CalendarDays,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { Assignment, AttendanceRecord, AttendanceStatus, ClassGroup, ClassScheduleSession, SkillType, Student, Submission } from '../types';
import { formatDateTime, formatMinutes, formatSecondsToTime, getBandColorClass, getTimeRemaining } from '../utils/formatters';
import { SkillBadge } from './SkillBadge';
import { ClassBadge } from './ClassBadge';
import { AttendanceManagement } from './AttendanceManagement';
import { StorageService } from '../services/storage';
import { AddStudentModal } from './AddStudentModal';
import { ClassModal } from './ClassModal';
import { AccountManagementModal } from './AccountManagementModal';
import { ScheduleSessionModal } from './ScheduleSessionModal';
import { ScheduleMonthCalendar } from './ScheduleMonthCalendar';
import { InClassResultsManagement } from './InClassResultsManagement';
import { TestResultsManagement } from './TestResultsManagement';
import { UserAccount } from '../types';

interface TeacherDashboardProps {
  assignments: Assignment[];
  students: Student[];
  submissions: Submission[];
  classes: ClassGroup[];
  accounts?: UserAccount[];
  selectedClassId: string;
  onClassChange?: (classId: string) => void;
  onOpenCreateAssignment: () => void;
  onOpenGrading: (submission: Submission, assignment?: Assignment) => void;
  onOpenStudentProfile: (student: Student) => void;
  onDeleteAssignment: (id: string) => void;
  onUpdateClasses?: (newClasses: ClassGroup[]) => void;
  onSaveClass?: (classData: ClassGroup, enrolledStudentIds?: string[]) => void;
  onDeleteClass?: (classId: string) => void;
  onSaveStudent?: (student: Student, accountCredentials?: { username: string; password: string }) => void;
  onDeleteStudent?: (studentId: string) => void;
  onSaveAccount?: (account: UserAccount) => void;
  onDeleteAccount?: (id: string) => void;
  isAccountModalOpen?: boolean;
  onCloseAccountModal?: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  assignments,
  students,
  submissions,
  classes,
  accounts = [],
  selectedClassId,
  onClassChange,
  onOpenCreateAssignment,
  onOpenGrading,
  onOpenStudentProfile,
  onDeleteAssignment,
  onUpdateClasses,
  onSaveClass,
  onDeleteClass,
  onSaveStudent,
  onDeleteStudent,
  onSaveAccount,
  onDeleteAccount,
  isAccountModalOpen = false,
  onCloseAccountModal,
}) => {
  // Navigation tab matching the user's authentic toolbar
  const [activeTab, setActiveTab] = useState<'classes' | 'assignments' | 'grading' | 'students' | 'attendance' | 'schedule' | 'in_class_results' | 'tests'>('classes');
  
  const inClassResultsCount = StorageService.getInClassResults().length;
  const testRecordsCount = StorageService.getTestRecords().length;
  
  // Filters & Search
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilterClassId, setCurrentFilterClassId] = useState<string>(selectedClassId || 'all');
  const [gradingFilter, setGradingFilter] = useState<'pending' | 'graded' | 'all'>('pending');
  const [studentFilter, setStudentFilter] = useState<'all' | 'needs_attention' | 'absent_warning'>('all');
  
  // Schedule / Timetable State
  const [schedules, setSchedules] = useState<ClassScheduleSession[]>(() => StorageService.getSchedules());
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingScheduleSession, setEditingScheduleSession] = useState<ClassScheduleSession | null>(null);
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [scheduleSkillFilter, setScheduleSkillFilter] = useState<string>('all');
  const [scheduleViewMode, setScheduleViewMode] = useState<'calendar' | 'list'>('calendar');

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceClassId, setAttendanceClassId] = useState<string>(classes[0]?.id || 'class-intensive-65');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => StorageService.getAttendance());
  const [attendanceViewMode, setAttendanceViewMode] = useState<'today' | 'history'>('today');
  const [attendanceToast, setAttendanceToast] = useState<string | null>(null);

  // Class Modal State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);

  // Student Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentModalDefaultClassId, setStudentModalDefaultClassId] = useState<string>('');

  // Account Management Modal State
  const [isLocalAccountModalOpen, setIsLocalAccountModalOpen] = useState(false);
  const effectiveAccountModalOpen = isAccountModalOpen || isLocalAccountModalOpen;
  const handleCloseAccountModal = () => {
    setIsLocalAccountModalOpen(false);
    if (onCloseAccountModal) onCloseAccountModal();
  };

  // Selected assignment for breakdown modal / view
  const [selectedAssignmentForBreakdown, setSelectedAssignmentForBreakdown] = useState<Assignment | null>(null);

  const showToast = (msg: string) => {
    setAttendanceToast(msg);
    setTimeout(() => setAttendanceToast(null), 3000);
  };

  // Helper to calculate missing/unsubmitted assignments for a student
  const getStudentMissingAssignments = (student: Student) => {
    const classAssignments = assignments.filter(
      (a) => a.classId === student.classId || a.classId === 'all'
    );
    const studentSubmissions = submissions.filter((sub) => sub.studentId === student.id);
    const submittedAssignIds = new Set(studentSubmissions.map((s) => s.assignmentId));
    const unsubmitted = classAssignments.filter((a) => !submittedAssignIds.has(a.id));
    return {
      unsubmitted,
      count: unsubmitted.length,
      totalApplicable: classAssignments.length,
      isAlert: unsubmitted.length >= 2, // Cần lưu ý: Chưa nộp từ 2 bài trở lên
    };
  };

  // Helper to calculate monthly absences for a student (Báo động: nghỉ quá 2 buổi trong 1 tháng)
  const getStudentAttendanceAlert = (studentId: string) => {
    const records = attendanceRecords.filter((r) => r.studentId === studentId);
    const monthStats: Record<string, { absentCount: number; excusedCount: number; totalAbsence: number; dates: string[] }> = {};
    
    records.forEach((r) => {
      if (r.status === 'absent' || r.status === 'excused') {
        const monthKey = r.date.slice(0, 7); // 'YYYY-MM'
        if (!monthStats[monthKey]) {
          monthStats[monthKey] = { absentCount: 0, excusedCount: 0, totalAbsence: 0, dates: [] };
        }
        if (r.status === 'absent') {
          monthStats[monthKey].absentCount += 1;
        } else if (r.status === 'excused') {
          monthStats[monthKey].excusedCount += 1;
        }
        monthStats[monthKey].totalAbsence += 1;
        monthStats[monthKey].dates.push(r.date);
      }
    });

    let maxMonthlyAbsences = 0;
    let worstMonth = '';
    let maxUnexcused = 0;

    Object.entries(monthStats).forEach(([mKey, stats]) => {
      if (stats.totalAbsence > maxMonthlyAbsences) {
        maxMonthlyAbsences = stats.totalAbsence;
        worstMonth = mKey;
      }
      if (stats.absentCount > maxUnexcused) {
        maxUnexcused = stats.absentCount;
      }
    });

    // Nghỉ quá 2 buổi trong 1 tháng
    const isAlert = maxMonthlyAbsences > 2 || maxUnexcused >= 2;

    return {
      monthStats,
      maxMonthlyAbsences,
      worstMonth,
      maxUnexcused,
      isAlert,
    };
  };

  // Student counts for badges
  const needsAttentionStudentsCount = students.filter((s) => {
    const missing = getStudentMissingAssignments(s);
    return missing.isAlert || s.lateSubmissions >= 2 || s.currentEstimatedBand < s.targetBand - 0.5;
  }).length;

  const absentAlertStudentsCount = students.filter((s) => {
    const att = getStudentAttendanceAlert(s.id);
    return att.isAlert;
  }).length;

  // Filter students based on selected class & search
  const filteredStudents = students.filter((s) => {
    const matchClass =
      currentFilterClassId === 'all' ||
      s.classId === currentFilterClassId ||
      (s.classIds && s.classIds.includes(currentFilterClassId));
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchClass || !matchSearch) return false;
    if (studentFilter === 'needs_attention') {
      const missing = getStudentMissingAssignments(s);
      return missing.isAlert || s.lateSubmissions >= 2 || s.currentEstimatedBand < s.targetBand - 0.5;
    }
    if (studentFilter === 'absent_warning') {
      const att = getStudentAttendanceAlert(s.id);
      return att.isAlert;
    }
    return true;
  });

  // Filter assignments based on selected class & search
  const filteredAssignments = assignments.filter((a) => {
    const matchClass = currentFilterClassId === 'all' || a.classId === currentFilterClassId || a.classId === 'all';
    const matchSkill = skillFilter === 'all' || a.skill === skillFilter;
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSkill && matchSearch;
  });

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchedAssign = assignments.find((a) => a.id === sub.assignmentId);
    const matchClass = currentFilterClassId === 'all' || (matchedAssign && (matchedAssign.classId === currentFilterClassId || matchedAssign.classId === 'all'));
    if (!matchClass) return false;

    if (gradingFilter === 'pending') return sub.status === 'submitted';
    if (gradingFilter === 'graded') return sub.status === 'graded';
    return true;
  });

  // Filter schedules based on class, status, skill, search
  const filteredSchedules = schedules.filter((sch) => {
    const matchClass = currentFilterClassId === 'all' || sch.classId === currentFilterClassId;
    const matchStatus = scheduleStatusFilter === 'all' || sch.status === scheduleStatusFilter;
    const matchSkill = scheduleSkillFilter === 'all' || sch.skillFocus === scheduleSkillFilter;
    const matchSearch = sch.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        sch.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        sch.className.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchStatus && matchSkill && matchSearch;
  });

  const upcomingSchedulesCount = schedules.filter((s) => s.status === 'upcoming').length;
  const completedSchedulesCount = schedules.filter((s) => s.status === 'completed').length;

  // Analytics Metrics
  const totalAssignmentsCount = assignments.length;
  const pendingGradingCount = submissions.filter((s) => s.status === 'submitted').length;
  
  // Calculate average band of graded submissions
  const gradedSubs = submissions.filter((s) => s.status === 'graded' && s.overallBand);
  const avgClassBand = gradedSubs.length > 0
    ? (gradedSubs.reduce((acc, curr) => acc + (curr.overallBand || 0), 0) / gradedSubs.length).toFixed(1)
    : '6.7';

  // Attendance helpers
  const currentClassStudents = students.filter((s) => s.classId === attendanceClassId);
  const activeAttendanceClass = classes.find((c) => c.id === attendanceClassId) || classes[0];
  
  const getStudentAttendanceStatus = (studentId: string): AttendanceStatus => {
    const rec = attendanceRecords.find(
      (r) => r.studentId === studentId && r.classId === attendanceClassId && r.date === attendanceDate
    );
    return rec ? rec.status : 'present';
  };

  const getStudentAttendanceNote = (studentId: string): string => {
    const rec = attendanceRecords.find(
      (r) => r.studentId === studentId && r.classId === attendanceClassId && r.date === attendanceDate
    );
    return rec?.notes || '';
  };

  const handleUpdateStudentAttendance = (studentId: string, studentName: string, status: AttendanceStatus) => {
    const existingIndex = attendanceRecords.findIndex(
      (r) => r.studentId === studentId && r.classId === attendanceClassId && r.date === attendanceDate
    );

    let updated: AttendanceRecord[];
    if (existingIndex >= 0) {
      updated = attendanceRecords.map((r, idx) => 
        idx === existingIndex ? { ...r, status } : r
      );
    } else {
      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}-${studentId}`,
        studentId,
        studentName,
        classId: attendanceClassId,
        date: attendanceDate,
        status,
      };
      updated = [newRec, ...attendanceRecords];
    }

    setAttendanceRecords(updated);
    StorageService.saveAttendance(updated);
  };

  const handleUpdateStudentNote = (studentId: string, studentName: string, notes: string) => {
    const existingIndex = attendanceRecords.findIndex(
      (r) => r.studentId === studentId && r.classId === attendanceClassId && r.date === attendanceDate
    );

    let updated: AttendanceRecord[];
    if (existingIndex >= 0) {
      updated = attendanceRecords.map((r, idx) => 
        idx === existingIndex ? { ...r, notes } : r
      );
    } else {
      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}-${studentId}`,
        studentId,
        studentName,
        classId: attendanceClassId,
        date: attendanceDate,
        status: 'present',
        notes,
      };
      updated = [newRec, ...attendanceRecords];
    }

    setAttendanceRecords(updated);
    StorageService.saveAttendance(updated);
  };

  const handleBulkAttendanceStatus = (status: AttendanceStatus, label: string) => {
    let updated = [...attendanceRecords];
    currentClassStudents.forEach((st) => {
      const idx = updated.findIndex(
        (r) => r.studentId === st.id && r.classId === attendanceClassId && r.date === attendanceDate
      );
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], status };
      } else {
        updated.push({
          id: `att-${Date.now()}-${st.id}`,
          studentId: st.id,
          studentName: st.name,
          classId: attendanceClassId,
          date: attendanceDate,
          status,
        });
      }
    });

    setAttendanceRecords(updated);
    StorageService.saveAttendance(updated);
    showToast(`Đã cập nhật tất cả học sinh: ${label}!`);
  };

  // Class Management Handlers
  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls: ClassGroup) => {
    setEditingClass(cls);
    setIsClassModalOpen(true);
  };

  const handleSaveClassInternal = (classData: ClassGroup, enrolledStudentIds?: string[]) => {
    if (onSaveClass) {
      onSaveClass(classData, enrolledStudentIds);
    } else {
      const exists = classes.some((c) => c.id === classData.id);
      let updated: ClassGroup[];
      if (exists) {
        updated = classes.map((c) => (c.id === classData.id ? classData : c));
      } else {
        updated = [...classes, classData];
      }
      StorageService.saveClasses(updated);
      if (onUpdateClasses) onUpdateClasses(updated);
    }

    if (enrolledStudentIds && enrolledStudentIds.length > 0) {
      const updatedStudents = students.map((st) => {
        if (enrolledStudentIds.includes(st.id)) {
          const curIds = st.classIds && st.classIds.length > 0 ? st.classIds : [st.classId];
          const curNames = st.classNames && st.classNames.length > 0 ? st.classNames : [st.className];
          if (!curIds.includes(classData.id)) {
            return {
              ...st,
              classIds: [...curIds, classData.id],
              classNames: [...curNames, classData.name],
            };
          }
        }
        return st;
      });
      StorageService.saveStudents(updatedStudents);
    }
    showToast(`Đã lưu thông tin lớp "${classData.name}" thành công!`);
  };

  const handleDeleteClassInternal = (cls: ClassGroup) => {
    const classSts = students.filter((s) => s.classId === cls.id);
    if (classSts.length > 0) {
      const confirmMsg = `Lớp "${cls.name}" hiện đang có ${classSts.length} học viên. Bạn có chắc chắn muốn xóa lớp này?`;
      if (!window.confirm(confirmMsg)) return;
    } else {
      if (!window.confirm(`Bạn có chắc chắn muốn xóa lớp "${cls.name}"?`)) return;
    }

    if (onDeleteClass) {
      onDeleteClass(cls.id);
    } else {
      const updated = classes.filter((c) => c.id !== cls.id);
      StorageService.saveClasses(updated);
      if (onUpdateClasses) onUpdateClasses(updated);
    }
    showToast(`Đã xóa lớp "${cls.name}" thành công!`);
  };

  // Student Management Handlers
  const handleOpenAddStudent = (targetClassId?: string) => {
    setEditingStudent(null);
    setStudentModalDefaultClassId(targetClassId || (attendanceClassId !== 'all' ? attendanceClassId : classes[0]?.id || ''));
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (st: Student) => {
    setEditingStudent(st);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudentInternal = (studentData: Student, accountCredentials?: { username: string; password: string }) => {
    if (onSaveStudent) {
      onSaveStudent(studentData, accountCredentials);
    } else {
      const exists = students.some((s) => s.id === studentData.id);
      let updated: Student[];
      if (exists) {
        updated = students.map((s) => (s.id === studentData.id ? studentData : s));
      } else {
        updated = [studentData, ...students];
      }
      StorageService.saveStudents(updated);
    }
    showToast(`Đã thêm học sinh "${studentData.name}" vào lớp "${studentData.className}"!`);
  };

  const handleDeleteStudentInternal = (st: Student) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${st.name}" khỏi hệ thống?`)) return;

    if (onDeleteStudent) {
      onDeleteStudent(st.id);
    } else {
      const updated = students.filter((s) => s.id !== st.id);
      StorageService.saveStudents(updated);
    }
    showToast(`Đã xóa học sinh "${st.name}" thành công!`);
  };

  // Schedule Management Handlers
  const handleOpenCreateSchedule = (targetClassId?: string) => {
    setEditingScheduleSession(null);
    if (targetClassId && targetClassId !== 'all') {
      setCurrentFilterClassId(targetClassId);
    }
    setIsScheduleModalOpen(true);
  };

  const handleOpenEditSchedule = (session: ClassScheduleSession) => {
    setEditingScheduleSession(session);
    setIsScheduleModalOpen(true);
  };

  const handleSaveScheduleSessionInternal = (sessionData: ClassScheduleSession) => {
    const exists = schedules.some((s) => s.id === sessionData.id);
    let updated: ClassScheduleSession[];
    if (exists) {
      updated = schedules.map((s) => (s.id === sessionData.id ? sessionData : s));
    } else {
      updated = [sessionData, ...schedules];
    }
    // Sort chronologically
    updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.sessionNumber - b.sessionNumber);
    setSchedules(updated);
    StorageService.saveSchedules(updated);
    showToast(`Đã lưu buổi học "${sessionData.title}" vào thời khóa biểu!`);
  };

  const handleDeleteScheduleSessionInternal = (session: ClassScheduleSession) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "Buổi ${session.sessionNumber}: ${session.title}" khỏi thời khóa biểu?`)) return;
    const updated = schedules.filter((s) => s.id !== session.id);
    setSchedules(updated);
    StorageService.saveSchedules(updated);
    showToast('Đã xóa buổi học khỏi thời khóa biểu thành công!');
  };

  const handleToggleSessionStatus = (sessionId: string, newStatus: 'upcoming' | 'completed' | 'cancelled') => {
    const updated = schedules.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s));
    setSchedules(updated);
    StorageService.saveSchedules(updated);
    const label = newStatus === 'completed' ? 'Đã hoàn thành' : newStatus === 'cancelled' ? 'Đã hủy' : 'Sắp diễn ra';
    showToast(`Đã cập nhật trạng thái buổi học: ${label}`);
  };

  // Copy Attendance Report
  const handleCopyAttendanceReport = () => {
    const lines = [
      `📋 BÁO CÁO ĐIỂM DANH LỚP: ${activeAttendanceClass?.name || 'IELTS'}`,
      `📅 Ngày học: ${attendanceDate}`,
      `👨‍🏫 Giảng viên: ${activeAttendanceClass?.teacherName || 'Teacher'}`,
      `👥 Sĩ số: ${currentClassStudents.length} học viên`,
      `---------------------------------`,
      ...currentClassStudents.map((st, i) => {
        const stStatus = getStudentAttendanceStatus(st.id);
        const stNote = getStudentAttendanceNote(st.id);
        const statusMap = {
          present: '✅ Có mặt',
          late: '⚠️ Đi muộn',
          excused: '📩 Có phép',
          absent: '❌ Vắng mặt',
        };
        return `${i + 1}. ${st.name} - ${statusMap[stStatus]}${stNote ? ` (Ghi chú: ${stNote})` : ''}`;
      }),
      `---------------------------------`,
      `📊 Tỷ lệ chuyên cần: ${attendanceRate}%`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Đã sao chép báo cáo điểm danh vào bộ nhớ tạm!');
  };

  // Attendance stats for current date
  const presentCount = currentClassStudents.filter((s) => getStudentAttendanceStatus(s.id) === 'present').length;
  const lateCount = currentClassStudents.filter((s) => getStudentAttendanceStatus(s.id) === 'late').length;
  const excusedCount = currentClassStudents.filter((s) => getStudentAttendanceStatus(s.id) === 'excused').length;
  const absentCount = currentClassStudents.filter((s) => getStudentAttendanceStatus(s.id) === 'absent').length;
  const totalStudentsInAttClass = currentClassStudents.length || 1;
  const attendanceRate = Math.round(((presentCount + lateCount) / totalStudentsInAttClass) * 100);

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {attendanceToast && (
        <div className="fixed top-20 right-6 z-60 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{attendanceToast}</span>
        </div>
      )}

      {/* =========================================================================
          AUTHENTIC FUNCTION TOOLBAR (THANH CHỨC NĂNG CHÍNH)
      ========================================================================= */}
      <div className="w-full">
        {/* Main Tab Navigation Toolbar */}
        <div className="bg-[#181d4b] rounded-2xl p-2 sm:p-2.5 shadow-lg border border-blue-900/40 w-full">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            
            {/* 1. Quản lý Lớp học */}
            <button
              type="button"
              onClick={() => setActiveTab('classes')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'classes'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              <span>Quản lý Lớp ({classes.length})</span>
            </button>

            {/* 2. Bài tập */}
            <button
              type="button"
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'assignments'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Bài tập ({assignments.length})</span>
            </button>

            {/* 3. Bài nộp */}
            <button
              type="button"
              onClick={() => setActiveTab('grading')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'grading'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 shrink-0" />
              <span>Bài nộp ({pendingGradingCount})</span>
            </button>

            {/* 4. Học sinh */}
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'students'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Học sinh ({students.length})</span>
            </button>

            {/* 5. Thời khóa biểu & Lịch học */}
            <button
              type="button"
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>Thời khóa biểu ({schedules.length})</span>
            </button>

            {/* 6. Điểm danh */}
            <button
              type="button"
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <span>Điểm danh</span>
            </button>

            {/* 7. Kết quả trên lớp */}
            <button
              type="button"
              onClick={() => setActiveTab('in_class_results')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'in_class_results'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Kết quả trên lớp ({inClassResultsCount})</span>
            </button>

            {/* 8. Kết quả Test (Mini / Mid / Final) */}
            <button
              type="button"
              onClick={() => setActiveTab('tests')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tests'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/40'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Kết quả Test ({testRecordsCount})</span>
            </button>

          </div>
        </div>
      </div>

      {/* ================= TAB 1: CLASS MANAGEMENT (QUẢN LÝ LỚP HỌC) ================= */}
      {activeTab === 'classes' && (
        <div className="space-y-5">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
                Danh Sách & Quản Lý Các Lớp Học IELTS ({classes.length} lớp)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thêm lớp học mới, gán học sinh, theo dõi lịch học, band điểm trung bình và bài tập từng lớp
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => handleOpenCreateSchedule()}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200/80 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Lên Lịch Buổi Học</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAddStudent()}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Thêm Học Sinh</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreateClass}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tạo Lớp Mới</span>
              </button>
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const classStudents = students.filter((s) => s.classId === cls.id);
              const classAssigns = assignments.filter((a) => a.classId === cls.id || a.classId === 'all');
              
              const classBadge = cls.code || (
                cls.name.toLowerCase().includes('intensive') ? 'INT-88' :
                cls.name.toLowerCase().includes('foundation') ? 'FND-12' :
                cls.name.toLowerCase().includes('master') ? 'MAS-75' : 'IEL-01'
              );

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Tag & Subtle Actions */}
                    <div className="flex items-center justify-between">
                      <ClassBadge
                        classId={cls.id}
                        classes={classes}
                        size="md"
                      />

                      <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEditClass(cls)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Sửa thông tin lớp"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClassInternal(cls)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa lớp học"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Class Name */}
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mt-3.5">
                      {cls.name}
                    </h4>

                    {/* Schedule with Clock */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cls.schedule}</span>
                    </div>

                    {/* Stats 2-column Box */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="bg-[#f8faff] rounded-2xl py-3 px-2 text-center border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          SĨ SỐ
                        </span>
                        <span className="text-base sm:text-lg font-bold text-indigo-600">
                          {classStudents.length} học sinh
                        </span>
                      </div>

                      <div className="bg-[#f8faff] rounded-2xl py-3 px-2 text-center border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          BÀI TẬP
                        </span>
                        <span className="text-base sm:text-lg font-bold text-emerald-600">
                          {classAssigns.length} bài
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2.5 mt-6 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentFilterClassId(cls.id);
                        setActiveTab('assignments');
                      }}
                      className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 text-slate-800 font-semibold text-xs sm:text-sm rounded-xl text-center shadow-2xs transition-colors cursor-pointer"
                    >
                      Chọn quản lý lớp
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentFilterClassId(cls.id);
                        setActiveTab('schedule');
                      }}
                      title="Thời khóa biểu & lịch học"
                      className="p-2.5 bg-white hover:bg-blue-50 border border-blue-200/80 text-blue-600 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    >
                      <CalendarDays className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAttendanceClassId(cls.id);
                        setActiveTab('attendance');
                      }}
                      title="Điểm danh lớp học"
                      className="p-2.5 bg-white hover:bg-indigo-50 border border-indigo-200/80 text-indigo-600 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    >
                      <CalendarCheck className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ================= TAB 2: ASSIGNMENT MANAGER (BÀI TẬP & THEO DÕI THEO LỚP) ================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          
          {/* Filters Bar with Class Switcher */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Class Filter Dropdown */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-slate-500">Lớp:</span>
                <select
                  value={currentFilterClassId}
                  onChange={(e) => setCurrentFilterClassId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Tất cả lớp học ({classes.length})</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài tập..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Skill Filter Chips & Create Button */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto justify-between lg:justify-end">
              <div className="flex items-center gap-1.5 shrink-0">
                {[
                  { id: 'all', label: 'Tất cả kỹ năng' },
                  { id: 'writing', label: 'Writing' },
                  { id: 'reading', label: 'Reading' },
                  { id: 'speaking', label: 'Speaking' },
                  { id: 'listening', label: 'Listening' },
                  { id: 'vocabulary', label: 'Vocabulary' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSkillFilter(chip.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      skillFilter === chip.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={onOpenCreateAssignment}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ml-1"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Giao Bài Mới</span>
              </button>
            </div>

          </div>

          {/* Assignment Grid */}
          {filteredAssignments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Chưa có bài tập nào cho lớp được chọn!</p>
              <button
                type="button"
                onClick={onOpenCreateAssignment}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Giao Bài Mới Ngay</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssignments.map((assign) => {
                const remaining = getTimeRemaining(assign.deadline);
                const assignSubs = submissions.filter((s) => s.assignmentId === assign.id);
                const classStudentsInAssign = students.filter((s) => assign.classId === 'all' || s.classId === assign.classId);
                const totalClassStudents = classStudentsInAssign.length || 1;
                const subCount = assignSubs.length;
                const subRate = Math.min(100, Math.round((subCount / totalClassStudents) * 100));
                const matchedClass = classes.find((c) => c.id === assign.classId);
                const classBadge = assign.classId === 'all' 
                  ? 'ALL' 
                  : (matchedClass?.code || (assign.className?.includes('Intensive') ? 'INT-88' : assign.className?.includes('Foundation') ? 'FND-12' : assign.className?.includes('Master') ? 'MAS-75' : 'LỚP HỌC'));

                return (
                  <div
                    key={assign.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SkillBadge skill={assign.skill} />
                          <ClassBadge
                            classId={assign.classId}
                            classes={classes}
                            fallbackText={assign.className}
                            size="sm"
                          />
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
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
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {assign.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {assign.description}
                        </p>
                      </div>

                      {/* Class, Time Limit & Deadline Compact Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-1 font-medium text-slate-700">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="line-clamp-1 max-w-[140px]">{assign.className}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatMinutes(assign.timeLimitMinutes)}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500" title={`Hạn nộp: ${formatDateTime(assign.deadline)}`}>
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Hạn: {formatDateTime(assign.deadline)}</span>
                          </span>
                        </div>
                      </div>

                      {/* Submission Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">Tiến độ nộp bài:</span>
                          <span className="font-bold text-blue-600 font-mono">
                            {subCount}/{totalClassStudents} học sinh ({subRate}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${subRate}%` }}
                          ></div>
                        </div>
                      </div>

                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onDeleteAssignment(assign.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Xóa bài tập"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const firstSub = assignSubs.find((s) => s.status === 'submitted') || assignSubs[0];
                          if (firstSub) {
                            onOpenGrading(firstSub, assign);
                          } else {
                            setActiveTab('grading');
                          }
                        }}
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Xem Bài Nộp ({subCount})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 3: GRADING STUDIO (BÀI NỘP) ================= */}
      {activeTab === 'grading' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            
            {/* Class Filter */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-slate-500">Lớp:</span>
              <select
                value={currentFilterClassId}
                onChange={(e) => setCurrentFilterClassId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Tất cả lớp ({classes.length})</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              {[
                { id: 'pending', label: `Chưa chấm (${pendingGradingCount})` },
                { id: 'graded', label: `Đã chấm (${submissions.filter(s => s.status === 'graded').length})` },
                { id: 'all', label: `Tất cả (${submissions.length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setGradingFilter(f.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    gradingFilter === f.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Không có bài tập nào trong danh sách!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((sub) => {
                const matchedAssign = assignments.find((a) => a.id === sub.assignmentId);
                const isPending = sub.status === 'submitted';

                return (
                  <div
                    key={sub.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 flex-1">
                      <img
                        src={sub.studentAvatar}
                        alt={sub.studentName}
                        className="w-11 h-11 rounded-full object-cover border-2 border-blue-300 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">{sub.studentName}</h4>
                          <SkillBadge skill={sub.assignmentSkill} />
                          {matchedAssign && (
                            <ClassBadge
                              classId={matchedAssign.classId}
                              classes={classes}
                              fallbackText={matchedAssign.className}
                              size="sm"
                            />
                          )}
                          {isPending ? (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                              Chờ chấm điểm
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Đã chấm: {sub.scoreDisplay || `Band ${sub.overallBand?.toFixed(1)}`}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-slate-700">
                          {sub.assignmentTitle}
                        </p>

                        <p className="text-xs text-slate-500">
                          Nộp lúc: {formatDateTime(sub.submittedAt)} • Thời gian làm: {formatSecondsToTime(sub.timeSpentSeconds)}
                          {sub.wordCount ? ` • ${sub.wordCount} từ` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {(sub.scoreDisplay || sub.overallBand) && (
                        <div className="text-center px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl">
                          <span className="text-[10px] font-bold uppercase text-blue-600 block">
                            {sub.scoringSystem === 'scale_10' ? 'Điểm Số (10)' : sub.scoringSystem === 'scale_100' ? 'Điểm Số (%)' : sub.scoringSystem === 'letter_grade' ? 'Điểm Chữ' : 'Điểm / Band'}
                          </span>
                          <span className="text-base font-black text-blue-950 font-mono">
                            {sub.scoreDisplay || sub.overallBand?.toFixed(1)}
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenGrading(sub, matchedAssign)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                          isPending
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>{isPending ? 'Chấm Điểm & Nhận Xét' : 'Xem & Sửa Điểm'}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 4: STUDENT DIRECTORY (HỌC SINH & THÊM HỌC SINH VÀO LỚP) ================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          
          {/* Filter Bar with Add Student Button */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              
              {/* Class Filter */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-medium text-slate-500 shrink-0">Lớp:</span>
                <select
                  value={currentFilterClassId}
                  onChange={(e) => setCurrentFilterClassId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Tất cả lớp ({classes.length})</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative flex-1 min-w-[200px] sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm tên học sinh, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

            </div>

            <div className="flex flex-wrap items-center justify-between xl:justify-end gap-2.5 w-full xl:w-auto">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setStudentFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    studentFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({students.length})
                </button>

                <button
                  type="button"
                  onClick={() => setStudentFilter('needs_attention')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    studentFilter === 'needs_attention'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-200/90 hover:bg-amber-100'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Cần lưu ý: Chưa nộp ≥2 bài</span>
                  {needsAttentionStudentsCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        studentFilter === 'needs_attention' ? 'bg-white text-amber-800' : 'bg-amber-600 text-white'
                      }`}
                    >
                      {needsAttentionStudentsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStudentFilter('absent_warning')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    studentFilter === 'absent_warning'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-800 border border-rose-200/90 hover:bg-rose-100'
                  }`}
                >
                  <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                  <span>Báo động: Nghỉ &gt; 2 buổi/tháng</span>
                  {absentAlertStudentsCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        studentFilter === 'absent_warning' ? 'bg-white text-rose-800' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {absentAlertStudentsCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => setIsLocalAccountModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <KeyRound className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Cấp Tài Khoản HS</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAddStudent(currentFilterClassId !== 'all' ? currentFilterClassId : undefined)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4 shrink-0" />
                  <span>Thêm Học Sinh Mới</span>
                </button>
              </div>
            </div>

          </div>

          {/* Student Cards */}
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Chưa có học viên nào trong danh mục này!</p>
              <button
                type="button"
                onClick={() => handleOpenAddStudent()}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm Học Sinh Ngay</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((st) => {
                const missing = getStudentMissingAssignments(st);
                const attAlert = getStudentAttendanceAlert(st.id);

                return (
                  <div
                    key={st.id}
                    className={`p-5 bg-white rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                      attAlert.isAlert
                        ? 'border-rose-300 ring-2 ring-rose-100'
                        : missing.isAlert
                        ? 'border-amber-300 ring-2 ring-amber-100'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-3">
                      
                      {/* Header & Quick Action */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={st.avatar}
                            alt={st.name}
                            className={`w-12 h-12 rounded-full object-cover border-2 shrink-0 ${
                              attAlert.isAlert
                                ? 'border-rose-500 ring-2 ring-rose-200'
                                : missing.isAlert
                                ? 'border-amber-500 ring-2 ring-amber-200'
                                : 'border-blue-300'
                            }`}
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{st.name}</h4>
                            <div className="mt-1 flex items-center gap-1 flex-wrap">
                              {(st.classIds && st.classIds.length > 0 ? st.classIds : [st.classId]).map((cid) => {
                                const cObj = classes.find((c) => c.id === cid);
                                return (
                                  <ClassBadge
                                    key={cid}
                                    classId={cid}
                                    classes={classes}
                                    fallbackText={cObj?.name || st.className}
                                    size="sm"
                                  />
                                );
                              })}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">{st.phone || st.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Status Warnings & Attendance Alert Badges */}
                      {attAlert.isAlert && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-900">
                          <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="text-xs leading-tight">
                            <span className="font-bold block text-rose-950">
                              🚨 Báo động: Nghỉ {attAlert.maxMonthlyAbsences} buổi trong tháng
                            </span>
                            <span className="text-[11px] text-rose-700 block mt-0.5">
                              Học sinh đã nghỉ quá 2 buổi/tháng (vượt mức cho phép)
                            </span>
                          </div>
                        </div>
                      )}

                      {missing.isAlert ? (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="text-xs leading-tight">
                            <span className="font-bold block text-amber-950">
                              ⚠️ Cần lưu ý: Chưa nộp {missing.count} bài tập
                            </span>
                            <span className="text-[11px] text-amber-800 block mt-0.5">
                              Chưa nộp từ 2 bài trở lên, cần nhắc nhở hoàn thành
                            </span>
                          </div>
                        </div>
                      ) : missing.count === 1 ? (
                        <div className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Còn 1 bài tập chưa nộp</span>
                        </div>
                      ) : (
                        <div className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã nộp đầy đủ bài ({missing.totalApplicable} bài)</span>
                        </div>
                      )}

                      {/* Band Badges: Chỉ hiển thị Band Overall Ước Tính và Band Mục Tiêu */}
                      <div className="flex items-center justify-between p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                        <div>
                          <span className="text-[11px] font-medium text-slate-500 block">Band Overall Ước Tính</span>
                          <span className="text-xl font-black text-blue-700 font-mono">
                            {st.currentEstimatedBand.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-medium text-slate-500 block">Band Mục Tiêu</span>
                          <span className="text-xl font-black text-slate-800 font-mono">
                            {st.targetBand.toFixed(1)}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEditStudent(st)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                        title="Chỉnh sửa thông tin học sinh"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteStudentInternal(st)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Xóa học sinh"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenStudentProfile(st)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Hồ Sơ & Lộ Trình</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 5: ATTENDANCE (ĐIỂM DANH HỌC SINH & MA TRẬN CHUYÊN CẦN) ================= */}
      {activeTab === 'attendance' && (
        <AttendanceManagement
          classes={classes}
          students={students}
          schedules={schedules}
          attendanceRecords={attendanceRecords}
          onSaveAttendance={(updated) => {
            setAttendanceRecords(updated);
            StorageService.saveAttendance(updated);
          }}
          onOpenAddStudent={handleOpenAddStudent}
          initialClassId={currentFilterClassId !== 'all' ? currentFilterClassId : undefined}
        />
      )}

      {/* ================= TAB 5: SCHEDULE & TIMETABLE (THỜI KHÓA BIỂU & LỊCH HỌC) ================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          
          {/* Header Action Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Thời Khóa Biểu & Kế Hoạch Nội Dung Bài Học
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lên lịch học từng buổi, phân bổ trọng tâm kỹ năng, tài liệu bài giảng và bài tập thực hành
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenCreateSchedule(currentFilterClassId !== 'all' ? currentFilterClassId : undefined)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Lên Lịch Buổi Học Mới</span>
                </button>
              </div>
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              {/* Filter by class */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Chọn Lớp Học
                </label>
                <select
                  value={currentFilterClassId}
                  onChange={(e) => setCurrentFilterClassId(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Tất cả các lớp ({classes.length})</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      [{cls.code || cls.name.slice(0, 7)}] {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Status */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Trạng Thái Buổi Học
                </label>
                <select
                  value={scheduleStatusFilter}
                  onChange={(e) => setScheduleStatusFilter(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="cancelled">Đã hủy / Tạm hoãn</option>
                </select>
              </div>

              {/* Filter by Skill Focus */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Kỹ Năng Trọng Tâm
                </label>
                <select
                  value={scheduleSkillFilter}
                  onChange={(e) => setScheduleSkillFilter(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">Tất cả kỹ năng</option>
                  <option value="Writing Task 1">Writing Task 1</option>
                  <option value="Writing Task 2">Writing Task 2</option>
                  <option value="Speaking">Speaking (Part 1, 2, 3)</option>
                  <option value="Reading">Reading Comprehension</option>
                  <option value="Listening">Listening Section</option>
                  <option value="Full Mock Test">Full Mock Test 4 Kỹ Năng</option>
                  <option value="Grammar & Vocab">Grammar & Vocab Bổ Trợ</option>
                </select>
              </div>

              {/* View Mode Toggle & Search */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Chế Độ Xem & Tìm Kiếm
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setScheduleViewMode('calendar')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
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
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        scheduleViewMode === 'list'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Xem dạng Danh Sách"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Danh sách</span>
                    </button>
                  </div>

                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm chủ đề..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  TỔNG SỐ BUỔI HỌC
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block font-mono">
                  {schedules.length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  SẮP DIỄN RA
                </span>
                <span className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5 block font-mono">
                  {upcomingSchedulesCount}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  ĐÃ HOÀN THÀNH
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 block font-mono">
                  {completedSchedulesCount}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  LỚP ĐANG XEM
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1 block truncate max-w-[130px]">
                  {currentFilterClassId === 'all'
                    ? 'Tất cả các lớp'
                    : classes.find((c) => c.id === currentFilterClassId)?.name || 'Lớp học'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Schedule Sessions Presentation (Calendar or List View) */}
          {scheduleViewMode === 'calendar' ? (
            <ScheduleMonthCalendar
              schedules={filteredSchedules}
              classes={classes}
              currentFilterClassId={currentFilterClassId}
              onOpenCreateSession={handleOpenCreateSchedule}
              onOpenEditSession={handleOpenEditSchedule}
              onDeleteSession={handleDeleteScheduleSessionInternal}
              onToggleSessionStatus={handleToggleSessionStatus}
            />
          ) : (
            filteredSchedules.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Chưa có buổi học nào trong danh sách
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                  Lên lịch học cho các lớp để quản lý giáo án, kỹ năng trọng tâm và chuẩn bị tài liệu cho từng buổi.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenCreateSchedule(currentFilterClassId !== 'all' ? currentFilterClassId : undefined)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  + Thêm Buổi Học Đầu Tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
              {filteredSchedules.map((session) => {
                const matchedClass = classes.find((c) => c.id === session.classId);
                const classBadge = matchedClass?.code || (
                  session.className.toLowerCase().includes('intensive') ? 'INT-88' :
                  session.className.toLowerCase().includes('foundation') ? 'FND-12' :
                  session.className.toLowerCase().includes('master') ? 'MAS-75' : 'IEL-01'
                );

                // Format session date
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
                    className={`bg-white rounded-3xl p-6 border transition-all shadow-2xs hover:shadow-md ${
                      session.status === 'completed'
                        ? 'border-emerald-200/80 bg-slate-50/40'
                        : session.status === 'cancelled'
                        ? 'border-rose-200/80 opacity-75'
                        : 'border-slate-200/90'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                      
                      {/* Left: Main Details */}
                      <div className="space-y-3 flex-1">
                        
                        {/* Badges Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg shadow-2xs">
                            Buổi {session.sessionNumber}
                          </span>

                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-xs rounded-lg">
                            {classBadge} • {session.className}
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
                             session.status === 'cancelled' ? '✕ Đã hủy / Nghỉ' : '⏳ Sắp diễn ra'}
                          </span>
                        </div>

                        {/* Session Title */}
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                            {session.title}
                          </h4>
                          
                          {/* Date, Time, Location Bar */}
                          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mt-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              <span>{formattedDate}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
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

                        {/* Topic & Syllabus Content Box */}
                        <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 text-xs text-slate-700 space-y-2">
                          <div>
                            <span className="font-bold text-slate-900 block mb-0.5">
                              📖 Nội dung & Kiến thức trọng tâm:
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

                          {session.notes && (
                            <div className="pt-2 border-t border-slate-200/60 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-indigo-900">Ghi chú sư phạm: </span>
                                <span className="text-slate-600 italic">{session.notes}</span>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Right: Actions & Quick Status Change */}
                      <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        
                        {/* Status Toggle buttons */}
                        <div className="flex items-center gap-1.5">
                          {session.status !== 'completed' && (
                            <button
                              type="button"
                              onClick={() => handleToggleSessionStatus(session.id, 'completed')}
                              title="Đánh dấu đã hoàn thành buổi học"
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Hoàn thành</span>
                            </button>
                          )}

                          {session.status === 'completed' && (
                            <button
                              type="button"
                              onClick={() => handleToggleSessionStatus(session.id, 'upcoming')}
                              title="Đặt lại thành sắp diễn ra"
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Chưa học</span>
                            </button>
                          )}

                          {session.materialsUrl && (
                            <a
                              href={session.materialsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                              title="Mở tài liệu buổi học"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Slide / Tài liệu</span>
                            </a>
                          )}
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditSchedule(session)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="Chỉnh sửa buổi học"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteScheduleSessionInternal(session)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Xóa buổi học"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
            )
          )}

        </div>
      )}

      {/* ================= TAB 7: IN-CLASS RESULTS (KẾT QUẢ TRÊN LỚP) ================= */}
      {activeTab === 'in_class_results' && (
        <InClassResultsManagement
          classes={classes}
          students={students}
          selectedClassId={currentFilterClassId}
          onOpenStudentProfile={onOpenStudentProfile}
        />
      )}

      {/* ================= TAB 8: TEST RESULTS (KẾT QUẢ BÀI TEST: MINI, MID, FINAL) ================= */}
      {activeTab === 'tests' && (
        <TestResultsManagement
          classes={classes}
          students={students}
          onOpenStudentProfile={onOpenStudentProfile}
        />
      )}

      {/* ================= MODAL: THỜI KHÓA BIỂU & NỘI DUNG BUỔI HỌC ================= */}
      <ScheduleSessionModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        classes={classes}
        students={students}
        defaultClassId={currentFilterClassId !== 'all' ? currentFilterClassId : classes[0]?.id || ''}
        sessionToEdit={editingScheduleSession}
        onSaveSession={handleSaveScheduleSessionInternal}
      />

      {/* ================= MODAL: THÊM / CHỈNH SỬA LỚP HỌC ================= */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        classToEdit={editingClass}
        allStudents={students}
        onSaveClass={handleSaveClassInternal}
      />

      {/* ================= MODAL: THÊM / CHỈNH SỬA HỌC SINH VÀO LỚP ================= */}
      <AddStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        classes={classes}
        defaultClassId={studentModalDefaultClassId}
        studentToEdit={editingStudent}
        onSaveStudent={handleSaveStudentInternal}
      />

      {/* ================= MODAL: QUẢN LÝ VÀ CẤP TÀI KHOẢN HỌC SINH ================= */}
      <AccountManagementModal
        isOpen={effectiveAccountModalOpen}
        onClose={handleCloseAccountModal}
        accounts={accounts}
        students={students}
        classes={classes}
        onSaveAccount={(acc) => {
          if (onSaveAccount) onSaveAccount(acc);
          showToast(`Đã cập nhật thông tin tài khoản "${acc.name}"!`);
        }}
        onDeleteAccount={(id) => {
          if (onDeleteAccount) onDeleteAccount(id);
          showToast('Đã xóa tài khoản học sinh!');
        }}
        onOpenAddStudentModal={() => {
          handleCloseAccountModal();
          handleOpenAddStudent();
        }}
      />

    </div>
  );
};
