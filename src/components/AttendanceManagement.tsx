import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  History,
  Users,
  Check,
  X,
  Clock,
  FileText,
  Copy,
  Download,
  Filter,
  Search,
  UserCheck,
  Layers,
  ChevronDown,
  Calendar,
  AlertCircle,
  HelpCircle,
  BarChart3,
  UserPlus,
  MessageSquare,
  Send,
  Share2
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, ClassGroup, ClassScheduleSession, Student } from '../types';
import { ClassBadge } from './ClassBadge';
import { getClassTheme } from '../utils/classColors';

interface AttendanceManagementProps {
  classes: ClassGroup[];
  students: Student[];
  schedules: ClassScheduleSession[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (updated: AttendanceRecord[]) => void;
  onOpenAddStudent?: (classId: string) => void;
  initialClassId?: string;
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({
  classes,
  students,
  schedules,
  attendanceRecords,
  onSaveAttendance,
  onOpenAddStudent,
  initialClassId,
}) => {
  // Active selected class for attendance
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId && initialClassId !== 'all' ? initialClassId : (classes[0]?.id || '')
  );

  // Mode: 'matrix' (Ma trận bảng dọc/ngang) | 'session' (Điểm danh theo buổi) | 'student_detail' (Lịch sử từng người)
  const [viewMode, setViewMode] = useState<'matrix' | 'session' | 'student_detail'>('matrix');

  // Matrix Orientation: 'students_row' (Học sinh hàng dọc, Buổi học hàng ngang) vs 'sessions_row' (Buổi học hàng dọc, Học sinh hàng ngang)
  const [matrixOrientation, setMatrixOrientation] = useState<'students_row' | 'sessions_row'>('students_row');

  // Selected student for student_detail mode
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Selected date / session for single-session marking
  const [activeDate, setActiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');

  // Filter & Search in attendance
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto Parent / Zalo Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState<'daily_class_zalo' | 'student_parent_dm' | 'course_summary'>('daily_class_zalo');
  const [reportStudentId, setReportStudentId] = useState<string>('');
  const [reportLessonContent, setReportLessonContent] = useState<string>('Luyện Speaking Part 1 & Viết Task 2 Outline');
  const [reportHomeworkNote, setReportHomeworkNote] = useState<string>('Hoàn thiện bài viết nộp trước 20:00 ngày học tiếp theo');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const filteredClassStudents = useMemo(() => {
    if (!searchStudentQuery) return classStudents;
    return classStudents.filter((s) =>
      s.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchStudentQuery.toLowerCase())
    );
  }, [classStudents, searchStudentQuery]);

  // Class sessions (schedules)
  const classSessions = useMemo(() => {
    return schedules
      .filter((s) => s.classId === selectedClassId)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
      });
  }, [schedules, selectedClassId]);

  // Helper to find attendance record
  const getRecord = (studentId: string, date: string, sessionId?: string): AttendanceRecord | undefined => {
    return attendanceRecords.find((r) => {
      if (r.studentId !== studentId || r.classId !== selectedClassId) return false;
      if (sessionId && r.sessionId) return r.sessionId === sessionId;
      return r.date === date;
    });
  };

  // Update attendance for a single student and date/session
  const handleUpdateStatus = (studentId: string, studentName: string, date: string, status: AttendanceStatus, sessionId?: string) => {
    const existingIndex = attendanceRecords.findIndex((r) => {
      if (r.studentId !== studentId || r.classId !== selectedClassId) return false;
      if (sessionId && r.sessionId) return r.sessionId === sessionId;
      return r.date === date;
    });

    let updated: AttendanceRecord[];
    if (existingIndex >= 0) {
      updated = attendanceRecords.map((r, idx) =>
        idx === existingIndex ? { ...r, status, sessionId: sessionId || r.sessionId } : r
      );
    } else {
      const newRec: AttendanceRecord = {
        id: `att-${Date.now()}-${studentId}-${Math.random().toString(36).substr(2, 4)}`,
        studentId,
        studentName,
        classId: selectedClassId,
        date,
        sessionId,
        status,
      };
      updated = [newRec, ...attendanceRecords];
    }

    onSaveAttendance(updated);
  };

  // Cycle status on matrix cell click
  const handleCycleStatus = (studentId: string, studentName: string, date: string, sessionId?: string) => {
    const current = getRecord(studentId, date, sessionId)?.status || 'present';
    const statusCycle: Record<AttendanceStatus, AttendanceStatus> = {
      present: 'late',
      late: 'excused',
      excused: 'absent',
      absent: 'present',
    };
    const nextStatus = statusCycle[current];
    handleUpdateStatus(studentId, studentName, date, nextStatus, sessionId);
  };

  // Bulk mark for active session / date
  const handleBulkMark = (status: AttendanceStatus, label: string) => {
    let updated = [...attendanceRecords];
    classStudents.forEach((st) => {
      const idx = updated.findIndex((r) => {
        if (r.studentId !== st.id || r.classId !== selectedClassId) return false;
        if (activeSessionId && r.sessionId) return r.sessionId === activeSessionId;
        return r.date === activeDate;
      });

      if (idx >= 0) {
        updated[idx] = { ...updated[idx], status, sessionId: activeSessionId || updated[idx].sessionId };
      } else {
        updated.push({
          id: `att-${Date.now()}-${st.id}`,
          studentId: st.id,
          studentName: st.name,
          classId: selectedClassId,
          date: activeDate,
          sessionId: activeSessionId,
          status,
        });
      }
    });

    onSaveAttendance(updated);
    showToast(`Đã đánh dấu toàn bộ học sinh lớp ${activeClass?.name}: ${label}`);
  };

  // Copy Attendance Report for Clipboard
  const handleCopyReport = () => {
    if (!activeClass) return;
    const lines = [
      `📊 BÁO CÁO ĐIỂM DANH LỚP: ${activeClass.name.toUpperCase()} [${activeClass.code || 'IELTS'}]`,
      `📅 Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
      `👥 Sĩ số: ${classStudents.length} học viên`,
      `------------------------------------------`,
    ];

    classStudents.forEach((st, idx) => {
      const stRecords = attendanceRecords.filter((r) => r.studentId === st.id && r.classId === selectedClassId);
      const total = stRecords.length || 1;
      const presentCount = stRecords.filter((r) => r.status === 'present').length;
      const lateCount = stRecords.filter((r) => r.status === 'late').length;
      const excusedCount = stRecords.filter((r) => r.status === 'excused').length;
      const absentCount = stRecords.filter((r) => r.status === 'absent').length;
      const rate = Math.round(((presentCount + lateCount) / total) * 100);

      lines.push(
        `${idx + 1}. ${st.name} | Chuyên cần: ${rate}% (Có mặt: ${presentCount}, Muộn: ${lateCount}, Phép: ${excusedCount}, Vắng: ${absentCount})`
      );
    });

    lines.push(`------------------------------------------`);
    lines.push(`Ghi chú: ✓ = Có mặt | ⏰ = Đi muộn | 📝 = Có phép | ✕ = Vắng`);

    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Đã sao chép báo cáo điểm danh vào bộ nhớ tạm (sẵn sàng gửi Zalo/Email)!');
  };

  // Generate automated parent/Zalo report text
  const generateAttendanceReportText = (type: 'daily_class_zalo' | 'student_parent_dm' | 'course_summary', studentId?: string, targetDate: string = reportDate) => {
    if (!activeClass) return '';

    // Matching session
    const matchedSession = classSessions.find((s) => s.date === targetDate);
    const sessionTitle = matchedSession ? `[Buổi ${matchedSession.sessionNumber}] ${matchedSession.title}` : `Buổi học ngày ${targetDate}`;

    // Get attendance list for target date
    const dailyRecords = classStudents.map((st) => {
      const rec = getRecord(st.id, targetDate, matchedSession?.id);
      return {
        student: st,
        status: rec?.status || 'present',
        notes: rec?.notes || '',
      };
    });

    const presentList = dailyRecords.filter((r) => r.status === 'present');
    const lateList = dailyRecords.filter((r) => r.status === 'late');
    const excusedList = dailyRecords.filter((r) => r.status === 'excused');
    const absentList = dailyRecords.filter((r) => r.status === 'absent');

    if (type === 'student_parent_dm' && studentId) {
      const studentRec = dailyRecords.find((r) => r.student.id === studentId) || {
        student: classStudents.find((s) => s.id === studentId) || classStudents[0],
        status: 'present' as AttendanceStatus,
        notes: '',
      };

      const statusMap: Record<AttendanceStatus, string> = {
        present: '✅ Có mặt đúng giờ và tham gia tích cực',
        late: `⏰ Đi muộn ${studentRec.notes ? `(${studentRec.notes})` : ''}`,
        excused: `📝 Vắng mặt có phép ${studentRec.notes ? `(${studentRec.notes})` : ''}`,
        absent: `⚠️ Vắng mặt không phép ${studentRec.notes ? `(${studentRec.notes})` : ''}`,
      };

      return [
        `📩 [THÔNG BÁO TÌNH HÌNH ĐIỂM DANH & HỌC TẬP BUỔI HỌC]`,
        `Kính gửi Quý Phụ Huynh em: ${studentRec.student.name}`,
        `Lớp học: ${activeClass.name} [${activeClass.code || 'IELTS'}]`,
        `📅 Ngày học: ${targetDate} (${sessionTitle})`,
        `----------------------------------------`,
        `📌 Tình hình chuyên cần: ${statusMap[studentRec.status]}`,
        reportLessonContent ? `📖 Nội dung bài học hôm nay: ${reportLessonContent}` : '',
        reportHomeworkNote ? `📝 Bài tập về nhà cần hoàn thành: ${reportHomeworkNote}` : '',
        studentRec.notes ? `💡 Ghi chú của giáo viên: ${studentRec.notes}` : '',
        `----------------------------------------`,
        `Kính nhờ Quý Phụ Huynh nhắc nhở con chuẩn bị bài và hoàn thành bài tập đúng hạn.`,
        `Trân trọng cảm ơn Quý Phụ Huynh!`
      ].filter(Boolean).join('\n');
    }

    if (type === 'course_summary') {
      const summaryLines = [
        `📊 [TỔNG KẾT CHUYÊN CẦN KHÓA HỌC] - ${activeClass.name.toUpperCase()}`,
        `👥 Sĩ số: ${classStudents.length} học viên`,
        `📅 Cập nhật ngày: ${new Date().toLocaleDateString('vi-VN')}`,
        `----------------------------------------`,
        `🏆 BẢNG TỔNG HỢP CHUYÊN CẦN:`,
      ];

      classStudents.forEach((st, idx) => {
        const stRecords = attendanceRecords.filter((r) => r.studentId === st.id && r.classId === selectedClassId);
        const total = stRecords.length || 1;
        const presentCount = stRecords.filter((r) => r.status === 'present').length;
        const lateCount = stRecords.filter((r) => r.status === 'late').length;
        const excusedCount = stRecords.filter((r) => r.status === 'excused').length;
        const absentCount = stRecords.filter((r) => r.status === 'absent').length;
        const rate = Math.round(((presentCount + lateCount) / total) * 100);
        const icon = rate >= 90 ? '🌟' : rate >= 75 ? '▫️' : '⚠️';

        summaryLines.push(
          `${icon} ${idx + 1}. ${st.name}: ${rate}% (Có mặt: ${presentCount} | Muộn: ${lateCount} | Vắng phép: ${excusedCount} | Vắng: ${absentCount})`
        );
      });

      summaryLines.push(`----------------------------------------`);
      summaryLines.push(`Thầy cô tuyên dương các bạn học viên duy trì chuyên cần xuất sắc!`);
      return summaryLines.join('\n');
    }

    // Default: daily_class_zalo
    return [
      `📢 [BÁO CÁO ĐIỂM DANH BUỔI HỌC] - LỚP ${activeClass.name.toUpperCase()}`,
      `📅 Ngày: ${targetDate} | ${sessionTitle}`,
      `👥 Sĩ số: ${presentList.length + lateList.length}/${classStudents.length} học viên tham gia`,
      `----------------------------------------`,
      `✅ CÓ MẶT ĐÚNG GIỜ (${presentList.length} bạn):`,
      presentList.length > 0 ? presentList.map((r, i) => `   ${i + 1}. ${r.student.name}`).join('\n') : '   (Không có)',
      ``,
      lateList.length > 0 ? `⏰ ĐI MUỘN (${lateList.length} bạn):\n${lateList.map((r, i) => `   ${i + 1}. ${r.student.name} ${r.notes ? `(${r.notes})` : ''}`).join('\n')}\n` : '',
      excusedList.length > 0 ? `📝 VẮNG CÓ PHÉP (${excusedList.length} bạn):\n${excusedList.map((r, i) => `   ${i + 1}. ${r.student.name} ${r.notes ? `(${r.notes})` : ''}`).join('\n')}\n` : '',
      absentList.length > 0 ? `⚠️ VẮNG KHÔNG PHÉP (${absentList.length} bạn):\n${absentList.map((r, i) => `   ${i + 1}. ${r.student.name}`).join('\n')}\n` : '',
      `----------------------------------------`,
      reportLessonContent ? `📖 Nội dung buổi học: ${reportLessonContent}` : '',
      reportHomeworkNote ? `📝 Bài tập về nhà: ${reportHomeworkNote}` : '',
      `Chúc cả lớp học tập hiệu quả và nộp bài tập đúng hạn!`
    ].filter(Boolean).join('\n');
  };

  // Status visual pill helper
  const renderStatusBadge = (status?: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs" title="Có mặt">✓</span>;
      case 'late':
        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs" title="Đi muộn">⏰</span>;
      case 'excused':
        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs" title="Có phép">📝</span>;
      case 'absent':
        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs" title="Vắng mặt">✕</span>;
      default:
        return <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-400 font-bold text-xs" title="Chưa ghi nhận">-</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Controller Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Hệ Thống Điểm Danh & Lịch Sử Chuyên Cần
                </h3>
                {activeClass && (
                  <ClassBadge
                    classId={activeClass.id}
                    classes={classes}
                    size="sm"
                  />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem bảng ma trận tổng hợp cả lớp (cột dọc / hàng ngang) và lịch sử chi tiết từng học viên
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start lg:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'matrix' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bảng Ma Trận (Toàn Khóa)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('session')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'session' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Điểm Danh Theo Buổi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('student_detail');
                if (!selectedStudentId && classStudents[0]) {
                  setSelectedStudentId(classStudents[0].id);
                }
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'student_detail' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Lịch Sử Từng Người</span>
            </button>
          </div>

        </div>

        {/* Sub Header Filters: Class Selector, Search, Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 items-center">
          
          {/* Class Select */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              Chọn Lớp Học
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                const newStudents = students.filter((s) => s.classId === e.target.value);
                if (newStudents[0]) setSelectedStudentId(newStudents[0].id);
              }}
              className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  [{cls.code || 'LỚP'}] {cls.name} ({cls.schedule})
                </option>
              ))}
            </select>
          </div>

          {/* Student Search in class */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              Tìm Kiếm Học Viên
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nhập tên học sinh..."
                value={searchStudentQuery}
                onChange={(e) => setSearchStudentQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Orientation switch (when in matrix view) */}
          {viewMode === 'matrix' ? (
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                Bố Cục Bảng Ma Trận
              </label>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setMatrixOrientation('students_row')}
                  className={`flex-1 py-1 px-2 text-[11px] font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    matrixOrientation === 'students_row' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                  title="Học sinh là hàng ngang, buổi học là các cột"
                >
                  Cột: Buổi Học
                </button>
                <button
                  type="button"
                  onClick={() => setMatrixOrientation('sessions_row')}
                  className={`flex-1 py-1 px-2 text-[11px] font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    matrixOrientation === 'sessions_row' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                  }`}
                  title="Buổi học là các hàng, học sinh là các cột"
                >
                  Cột: Học Sinh
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => onOpenAddStudent && onOpenAddStudent(selectedClassId)}
                className="w-full py-2 px-3 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                <span>Thêm Học Viên Vào Lớp</span>
              </button>
            </div>
          )}

          {/* Export / Copy Report */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => {
                if (classStudents[0]) setReportStudentId(classStudents[0].id);
                setIsReportModalOpen(true);
              }}
              className="w-full py-2 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Báo Cáo Phụ Huynh / Zalo</span>
            </button>
          </div>

        </div>

      </div>

      {/* =========================================================================================
          VIEW 1: FULL-CLASS ATTENDANCE MATRIX TABLE (CỘT DỌC LÀ HỌC SINH / HÀNG NGANG LÀ BUỔI HỌC)
      ========================================================================================= */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4 p-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Ma Trận Chuyên Cần Khóa Học: {activeClass?.name}</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhấp trực tiếp vào ô để chuyển đổi trạng thái: <strong className="text-emerald-700">✓ Có mặt</strong> → <strong className="text-amber-700">⏰ Muộn</strong> → <strong className="text-blue-700">📝 Phép</strong> → <strong className="text-rose-700">✕ Vắng</strong>
              </p>
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                <span>✓</span> Có mặt
              </span>
              <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                <span>⏰</span> Muộn
              </span>
              <span className="flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                <span>📝</span> Phép
              </span>
              <span className="flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                <span>✕</span> Vắng
              </span>
            </div>
          </div>

          {filteredClassStudents.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Lớp học này chưa có học viên nào.</p>
              {onOpenAddStudent && (
                <button
                  type="button"
                  onClick={() => onOpenAddStudent(selectedClassId)}
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Thêm Học Sinh Vào Lớp</span>
                </button>
              )}
            </div>
          ) : classSessions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs">Lớp học này chưa có buổi học nào trong thời khóa biểu.</p>
              <p className="text-[11px] text-slate-500">Vui lòng chuyển sang tab Thời Khóa Biểu để xếp lịch bài học.</p>
            </div>
          ) : matrixOrientation === 'students_row' ? (
            /* =========================================================================
               LAYOUT A: ROWS = STUDENTS, COLUMNS = SESSIONS (CỰC KỲ DỄ THEO DÕI)
            ========================================================================= */
            <div className="overflow-x-auto pb-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3 min-w-[200px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                      Học Viên ({filteredClassStudents.length})
                    </th>
                    <th className="p-3 text-center min-w-[90px] border-r border-slate-200">
                      Tỷ Lệ %
                    </th>
                    {classSessions.map((sess) => (
                      <th
                        key={sess.id}
                        className="p-2.5 text-center min-w-[95px] border-r border-slate-100 hover:bg-slate-100 transition-colors"
                        title={`Buổi ${sess.sessionNumber}: ${sess.title} (${sess.date} ${sess.startTime})`}
                      >
                        <div className="font-mono text-[10px] text-blue-600 font-bold">
                          Buổi {sess.sessionNumber}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {sess.date.slice(5)}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono truncate max-w-[85px]">
                          {sess.startTime}
                        </div>
                      </th>
                    ))}
                    <th className="p-3 text-center min-w-[80px]">
                      Vắng
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClassStudents.map((st) => {
                    const stRecords = attendanceRecords.filter(
                      (r) => r.studentId === st.id && r.classId === selectedClassId
                    );
                    const totalSess = classSessions.length || 1;
                    const presentCount = stRecords.filter((r) => r.status === 'present').length;
                    const lateCount = stRecords.filter((r) => r.status === 'late').length;
                    const absentCount = stRecords.filter((r) => r.status === 'absent').length;
                    const attendanceRate = Math.round(((presentCount + lateCount) / totalSess) * 100);

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Student Name & Avatar Sticky */}
                        <td className="p-3 sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-200">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={st.avatar}
                              alt={st.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div className="truncate max-w-[150px]">
                              <span className="font-bold text-slate-900 block truncate">{st.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">Band {st.currentEstimatedBand.toFixed(1)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Attendance Rate */}
                        <td className="p-2.5 text-center font-mono font-bold border-r border-slate-200">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] ${
                              attendanceRate >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : attendanceRate >= 75
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {attendanceRate}%
                          </span>
                        </td>

                        {/* Interactive Session Cells */}
                        {classSessions.map((sess) => {
                          const record = getRecord(st.id, sess.date, sess.id);
                          const status = record?.status;

                          return (
                            <td
                              key={sess.id}
                              onClick={() => handleCycleStatus(st.id, st.name, sess.date, sess.id)}
                              className="p-2 text-center border-r border-slate-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
                              title={`Nhấp để đổi trạng thái: ${st.name} - Buổi ${sess.sessionNumber}`}
                            >
                              <div className="flex justify-center">
                                {renderStatusBadge(status)}
                              </div>
                            </td>
                          );
                        })}

                        {/* Absent Count */}
                        <td className="p-2.5 text-center font-mono font-bold">
                          {absentCount > 0 ? (
                            <span className="text-rose-600">{absentCount}</span>
                          ) : (
                            <span className="text-slate-300">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* =========================================================================
               LAYOUT B: ROWS = SESSIONS, COLUMNS = STUDENTS
            ========================================================================= */
            <div className="overflow-x-auto pb-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3 min-w-[200px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                      Buổi Học ({classSessions.length})
                    </th>
                    <th className="p-3 min-w-[100px] text-center border-r border-slate-200">
                      Thời Gian
                    </th>
                    {filteredClassStudents.map((st) => (
                      <th
                        key={st.id}
                        className="p-2.5 text-center min-w-[90px] border-r border-slate-100"
                        title={`${st.name} (${st.email})`}
                      >
                        <div className="font-bold text-slate-900 truncate max-w-[85px] mx-auto">
                          {st.name.split(' ').slice(-1)[0]}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate max-w-[85px] mx-auto">
                          {st.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classSessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Session Title Sticky */}
                      <td className="p-3 sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono font-bold text-[10px] rounded-md">
                            B{sess.sessionNumber}
                          </span>
                          <span className="font-bold text-slate-900 truncate max-w-[160px]" title={sess.title}>
                            {sess.title}
                          </span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-2.5 text-center font-mono text-[11px] text-slate-600 border-r border-slate-200">
                        <div>{sess.date}</div>
                        <div className="text-[10px] text-indigo-600">{sess.startTime} - {sess.endTime}</div>
                      </td>

                      {/* Student Status Cells */}
                      {filteredClassStudents.map((st) => {
                        const record = getRecord(st.id, sess.date, sess.id);
                        const status = record?.status;

                        return (
                          <td
                            key={st.id}
                            onClick={() => handleCycleStatus(st.id, st.name, sess.date, sess.id)}
                            className="p-2 text-center border-r border-slate-100 hover:bg-blue-50/50 cursor-pointer transition-colors"
                            title={`Nhấp để đổi: ${st.name} - Buổi ${sess.sessionNumber}`}
                          >
                            <div className="flex justify-center">
                              {renderStatusBadge(status)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================================
          VIEW 2: MARK ATTENDANCE BY SPECIFIC SESSION / DATE (ĐIỂM DANH THEO TỪNG BUỔI)
      ========================================================================================= */}
      {viewMode === 'session' && (
        <div className="space-y-4">
          
          {/* Quick Session Picker Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-blue-600" />
                  <span>Điểm Danh Theo Từng Ca Học Cụ Thể</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn buổi học hoặc ngày học cụ thể để cập nhật chuyên cần và ghi chú sư phạm
                </p>
              </div>

              {/* Bulk Mark Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleBulkMark('present', 'TẤT CẢ CÓ MẶT')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tất cả Có mặt</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBulkMark('late', 'TẤT CẢ ĐI MUỘN')}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tất cả Muộn</span>
                </button>
              </div>
            </div>

            {/* Session Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
              {/* Select from existing scheduled sessions */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Chọn Buổi Học Đã Xếp Lịch ({classSessions.length} buổi)
                </label>
                <select
                  value={activeSessionId}
                  onChange={(e) => {
                    const sessId = e.target.value;
                    setActiveSessionId(sessId);
                    const found = classSessions.find((s) => s.id === sessId);
                    if (found) setActiveDate(found.date);
                  }}
                  className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">-- Chọn buổi học từ thời khóa biểu --</option>
                  {classSessions.map((sess) => (
                    <option key={sess.id} value={sess.id}>
                      [Buổi {sess.sessionNumber}] {sess.title} ({sess.date} {sess.startTime}-{sess.endTime})
                    </option>
                  ))}
                </select>
              </div>

              {/* Or Select Custom Date */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Hoặc Chọn Ngày Bất Kỳ
                </label>
                <input
                  type="date"
                  value={activeDate}
                  onChange={(e) => {
                    setActiveDate(e.target.value);
                    const matchingSess = classSessions.find((s) => s.date === e.target.value);
                    setActiveSessionId(matchingSess ? matchingSess.id : '');
                  }}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Student List with Full Status Buttons and Note Field */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Danh Sách Học Sinh: {activeClass?.name} ({filteredClassStudents.length} học viên)
              </span>
              <span className="text-xs font-mono text-blue-600 font-bold">
                Ngày: {activeDate}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredClassStudents.map((st) => {
                const record = getRecord(st.id, activeDate, activeSessionId);
                const currentStatus = record?.status || 'present';
                const currentNote = record?.notes || '';

                return (
                  <div
                    key={st.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={st.avatar}
                        alt={st.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shrink-0"
                      />
                      <div>
                        <h5 className="text-sm font-bold text-slate-900">{st.name}</h5>
                        <p className="text-xs text-slate-500">
                          {st.email} • Target Band {st.targetBand.toFixed(1)} • Hiện tại: <strong>Band {st.currentEstimatedBand.toFixed(1)}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* 4 Status Buttons */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(st.id, st.name, activeDate, 'present', activeSessionId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          ✓ Có mặt
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(st.id, st.name, activeDate, 'late', activeSessionId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          ⏰ Đi muộn
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(st.id, st.name, activeDate, 'excused', activeSessionId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'excused'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          📝 Có phép
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(st.id, st.name, activeDate, 'absent', activeSessionId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          ✕ Vắng
                        </button>
                      </div>

                      {/* Note Input */}
                      <input
                        type="text"
                        placeholder="Ghi chú (vd: đến trễ 10p, xin phép ốm)..."
                        value={currentNote}
                        onChange={(e) => {
                          const val = e.target.value;
                          const existingIndex = attendanceRecords.findIndex((r) => {
                            if (r.studentId !== st.id || r.classId !== selectedClassId) return false;
                            if (activeSessionId && r.sessionId) return r.sessionId === activeSessionId;
                            return r.date === activeDate;
                          });

                          let updated: AttendanceRecord[];
                          if (existingIndex >= 0) {
                            updated = attendanceRecords.map((r, idx) =>
                              idx === existingIndex ? { ...r, notes: val } : r
                            );
                          } else {
                            updated = [
                              {
                                id: `att-${Date.now()}-${st.id}`,
                                studentId: st.id,
                                studentName: st.name,
                                classId: selectedClassId,
                                date: activeDate,
                                sessionId: activeSessionId,
                                status: 'present',
                                notes: val,
                              },
                              ...attendanceRecords,
                            ];
                          }
                          onSaveAttendance(updated);
                        }}
                        className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg w-full sm:w-56 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================================
          VIEW 3: INDIVIDUAL STUDENT ATTENDANCE HISTORY (LỊCH SỬ ĐIỂM DANH TỪNG HỌC VIÊN)
      ========================================================================================= */}
      {viewMode === 'student_detail' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Left Column: Student Selector List */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Danh Sách Học Sinh Lớp ({classStudents.length})
            </h4>
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
              {filteredClassStudents.map((st) => {
                const isSelected = st.id === selectedStudentId;
                const stRecords = attendanceRecords.filter((r) => r.studentId === st.id && r.classId === selectedClassId);
                const total = stRecords.length || 1;
                const presentOrLate = stRecords.filter((r) => r.status === 'present' || r.status === 'late').length;
                const rate = Math.round((presentOrLate / total) * 100);

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-2xs'
                        : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img src={st.avatar} alt={st.name} className="w-8 h-8 rounded-full object-cover border shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-900 block truncate">{st.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Band {st.currentEstimatedBand.toFixed(1)}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        rate >= 90 ? 'bg-emerald-100 text-emerald-800' :
                        rate >= 75 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rate}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Chronological Timeline for Selected Student */}
          <div className="lg:col-span-2 space-y-4">
            {(() => {
              const currentSt = classStudents.find((s) => s.id === selectedStudentId) || classStudents[0];
              if (!currentSt) {
                return (
                  <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-12 text-center text-slate-400">
                    Vui lòng chọn 1 học sinh để xem lịch sử.
                  </div>
                );
              }

              const stRecords = attendanceRecords.filter(
                (r) => r.studentId === currentSt.id && r.classId === selectedClassId
              );
              const presentCount = stRecords.filter((r) => r.status === 'present').length;
              const lateCount = stRecords.filter((r) => r.status === 'late').length;
              const excusedCount = stRecords.filter((r) => r.status === 'excused').length;
              const absentCount = stRecords.filter((r) => r.status === 'absent').length;
              const totalSessions = classSessions.length || 1;
              const rate = Math.round(((presentCount + lateCount) / totalSessions) * 100);

              return (
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
                  {/* Student Profile Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={currentSt.avatar}
                        alt={currentSt.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-2xs shrink-0"
                      />
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{currentSt.name}</h4>
                        <p className="text-xs text-slate-500">
                          {currentSt.email} • Target Band {currentSt.targetBand.toFixed(1)} • Lớp: <strong>{activeClass?.name}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:self-auto self-start">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tỷ Lệ Chuyên Cần</span>
                      <span className={`text-2xl font-black font-mono ${rate >= 90 ? 'text-emerald-600' : rate >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {rate}%
                      </span>
                    </div>
                  </div>

                  {/* 4 Stats Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                      <span className="text-[10px] font-bold text-emerald-700 block uppercase">Có mặt</span>
                      <span className="text-lg font-black text-emerald-800 font-mono">{presentCount}</span>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                      <span className="text-[10px] font-bold text-amber-700 block uppercase">Đi muộn</span>
                      <span className="text-lg font-black text-amber-800 font-mono">{lateCount}</span>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center">
                      <span className="text-[10px] font-bold text-blue-700 block uppercase">Có phép</span>
                      <span className="text-lg font-black text-blue-800 font-mono">{excusedCount}</span>
                    </div>
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                      <span className="text-[10px] font-bold text-rose-700 block uppercase">Vắng không phép</span>
                      <span className="text-lg font-black text-rose-800 font-mono">{absentCount}</span>
                    </div>
                  </div>

                  {/* Chronological List of All Sessions for this student */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Lịch Sử Điểm Danh Từng Buổi Học ({classSessions.length} buổi)
                    </h5>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {classSessions.map((sess) => {
                        const rec = getRecord(currentSt.id, sess.date, sess.id);
                        const status = rec?.status || 'present';
                        const note = rec?.notes;

                        return (
                          <div
                            key={sess.id}
                            className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-[10px] rounded-md">
                                  Buổi {sess.sessionNumber}
                                </span>
                                <span className="text-xs font-bold text-slate-900">{sess.title}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                                <span>{sess.date}</span>
                                <span>•</span>
                                <span>{sess.startTime} - {sess.endTime}</span>
                              </div>
                              {note && (
                                <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
                                  💬 Ghi chú: {note}
                                </p>
                              )}
                            </div>

                            {/* Quick status selector */}
                            <div className="flex items-center gap-1 shrink-0">
                              {(['present', 'late', 'excused', 'absent'] as AttendanceStatus[]).map((stKey) => (
                                <button
                                  key={stKey}
                                  type="button"
                                  onClick={() => handleUpdateStatus(currentSt.id, currentSt.name, sess.date, stKey, sess.id)}
                                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                                    status === stKey
                                      ? stKey === 'present'
                                        ? 'bg-emerald-600 text-white'
                                        : stKey === 'late'
                                        ? 'bg-amber-500 text-white'
                                        : stKey === 'excused'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-rose-600 text-white'
                                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {stKey === 'present' ? '✓ Có mặt' :
                                   stKey === 'late' ? '⏰ Muộn' :
                                   stKey === 'excused' ? '📝 Phép' : '✕ Vắng'}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* =========================================================================
          AUTO-REPORT MODAL (GỬI BÁO CÁO ĐIỂM DANH CHO PHỤ HUYNH / ZALO)
      ========================================================================= */}
      {isReportModalOpen && activeClass && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600 rounded-2xl">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Báo Cáo Điểm Danh Tự Động (Zalo / Phụ Huynh)
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    Lớp: <strong>{activeClass.name}</strong> • Sẵn sàng sao chép gửi phụ huynh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Type Switcher */}
              <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setReportType('daily_class_zalo')}
                  className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    reportType === 'daily_class_zalo' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>1. Mẫu Nhóm Zalo Lớp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('student_parent_dm')}
                  className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    reportType === 'student_parent_dm' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>2. Mẫu Riêng Phụ Huynh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('course_summary')}
                  className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                    reportType === 'course_summary' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>3. Tổng Kết Khóa</span>
                </button>
              </div>

              {/* Date & Student Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Ngày điểm danh báo cáo:
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                {reportType === 'student_parent_dm' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Chọn học sinh cần gửi:
                    </label>
                    <select
                      value={reportStudentId}
                      onChange={(e) => setReportStudentId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {classStudents.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Lesson & Homework Custom Fields */}
              {reportType !== 'course_summary' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Nội dung trọng tâm buổi học:
                    </label>
                    <input
                      type="text"
                      value={reportLessonContent}
                      onChange={(e) => setReportLessonContent(e.target.value)}
                      placeholder="VD: Luyện phản xạ Speaking Part 1, Giải đề Reading Passage 2..."
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Dặn dò bài tập về nhà:
                    </label>
                    <input
                      type="text"
                      value={reportHomeworkNote}
                      onChange={(e) => setReportHomeworkNote(e.target.value)}
                      placeholder="VD: Nộp bài trước 20:00 thứ Năm, học 20 từ vựng Unit 4..."
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Preview Text Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Xem trước nội dung tin nhắn:
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Đã chuẩn bị sẵn mẫu tin
                  </span>
                </div>
                <textarea
                  readOnly
                  rows={10}
                  value={generateAttendanceReportText(reportType, reportStudentId, reportDate)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-mono leading-relaxed focus:outline-hidden select-all"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={() => {
                  const txt = generateAttendanceReportText(reportType, reportStudentId, reportDate);
                  navigator.clipboard.writeText(txt);
                  showToast('Đã sao chép tin nhắn báo cáo điểm danh vào bộ nhớ tạm!');
                  setIsReportModalOpen(false);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Sao Chép Tin Nhắn (Copy Zalo)</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
