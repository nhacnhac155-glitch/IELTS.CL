import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  ExternalLink,
  Edit3,
  Trash2,
  Check,
  X,
  PlusCircle,
  Layers,
  Filter,
  ListFilter
} from 'lucide-react';
import { ClassGroup, ClassScheduleSession } from '../types';
import { getClassTheme } from '../utils/classColors';
import { ClassBadge } from './ClassBadge';

interface ScheduleMonthCalendarProps {
  schedules: ClassScheduleSession[];
  classes: ClassGroup[];
  currentFilterClassId: string;
  onOpenCreateSession: (prefillDate?: string) => void;
  onOpenEditSession: (session: ClassScheduleSession) => void;
  onDeleteSession: (session: ClassScheduleSession) => void;
  onToggleSessionStatus: (sessionId: string, newStatus: 'upcoming' | 'completed' | 'cancelled') => void;
}

export const ScheduleMonthCalendar: React.FC<ScheduleMonthCalendarProps> = ({
  schedules,
  classes,
  currentFilterClassId,
  onOpenCreateSession,
  onOpenEditSession,
  onDeleteSession,
  onToggleSessionStatus,
}) => {
  // View mode: month grid vs list agenda
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calendar month navigation state
  const [currentDate, setCurrentDate] = useState(() => {
    const firstUpcoming = schedules.find((s) => s.status === 'upcoming') || schedules[0];
    if (firstUpcoming && firstUpcoming.date) {
      const d = new Date(firstUpcoming.date);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  // Modal / Drawer state for viewing a specific day's sessions or session detail
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<ClassScheduleSession | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const daysOfWeek = ['T2 (Thứ 2)', 'T3 (Thứ 3)', 'T4 (Thứ 4)', 'T5 (Thứ 5)', 'T6 (Thứ 6)', 'T7 (Thứ 7)', 'CN (Chủ Nhật)'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Compute grid days
  const firstDayOfMonth = new Date(year, month, 1);
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  interface CalendarDayCell {
    date: Date;
    dateStr: string; // YYYY-MM-DD
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    sessions: ClassScheduleSession[];
  }

  const calendarDays: CalendarDayCell[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  const formatToYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Group schedules by date string and sort by startTime
  const sessionsByDate: Record<string, ClassScheduleSession[]> = {};
  schedules.forEach((sch) => {
    if (!sessionsByDate[sch.date]) {
      sessionsByDate[sch.date] = [];
    }
    sessionsByDate[sch.date].push(sch);
  });

  // Sort sessions within each day chronologically
  Object.keys(sessionsByDate).forEach((dateKey) => {
    sessionsByDate[dateKey].sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
  });

  // Prev month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    const dStr = formatToYYYYMMDD(d);
    calendarDays.push({
      date: d,
      dateStr: dStr,
      dayNumber: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      sessions: sessionsByDate[dStr] || [],
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dStr = formatToYYYYMMDD(d);
    calendarDays.push({
      date: d,
      dateStr: dStr,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
      sessions: sessionsByDate[dStr] || [],
    });
  }

  // Next month padding days to fill 35 or 42 grid slots
  const totalSlots = calendarDays.length <= 35 ? 35 : 42;
  const nextMonthCount = totalSlots - calendarDays.length;
  for (let i = 1; i <= nextMonthCount; i++) {
    const d = new Date(year, month + 1, i);
    const dStr = formatToYYYYMMDD(d);
    calendarDays.push({
      date: d,
      dateStr: dStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      sessions: sessionsByDate[dStr] || [],
    });
  }

  // Selected date's sessions
  const selectedDateSessions = selectedDateStr ? sessionsByDate[selectedDateStr] || [] : [];

  return (
    <div className="space-y-4">
      {/* Calendar Header Navigation */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>{monthNames[month]}</span>
              <span className="text-blue-600 font-mono">Năm {year}</span>
              {currentFilterClassId !== 'all' && (
                <ClassBadge
                  classId={currentFilterClassId}
                  classes={classes}
                  size="sm"
                />
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Hỗ trợ xếp nhiều ca/lớp trong cùng 1 ngày với tag màu riêng biệt cho từng lớp
            </p>
          </div>
        </div>

        {/* Month Navigation & View Mode Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Lịch Tháng</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Thời Khóa Biểu</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleToday}
            className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Hôm nay
          </button>

          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Tháng trước"
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              title="Tháng sau"
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* VIEW 1: MONTHLY CALENDAR GRID */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center">
            {daysOfWeek.map((day, idx) => (
              <div
                key={day}
                className={`py-3 text-[11px] sm:text-xs font-bold tracking-wider uppercase ${
                  idx >= 5 ? 'text-amber-700 bg-amber-50/30' : 'text-slate-600'
                }`}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.split(' ')[0]}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-slate-100">
            {calendarDays.map((cell, idx) => {
              const hasSessions = cell.sessions.length > 0;
              const isMultiSession = cell.sessions.length > 1;

              return (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  onClick={() => {
                    if (hasSessions) {
                      setSelectedDateStr(cell.dateStr);
                    } else {
                      onOpenCreateSession(cell.dateStr);
                    }
                  }}
                  className={`min-h-[105px] sm:min-h-[130px] p-1.5 sm:p-2.5 transition-all flex flex-col justify-between cursor-pointer group ${
                    cell.isCurrentMonth ? 'bg-white hover:bg-blue-50/30' : 'bg-slate-50/60 hover:bg-slate-100/80 text-slate-400'
                  } ${cell.isToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/15' : ''}`}
                >
                  {/* Header of the cell: Day number + Multi-session count + Add button on hover */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                          cell.isToday
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : cell.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {isMultiSession && (
                        <span
                          className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-100 text-indigo-700 border border-indigo-200"
                          title="Ngày có nhiều buổi học"
                        >
                          {cell.sessions.length} ca
                        </span>
                      )}
                    </div>

                    {/* Add session button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCreateSession(cell.dateStr);
                      }}
                      title={`Thêm buổi học vào ngày ${cell.dateStr}`}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 text-blue-600 rounded-md transition-opacity cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Sessions within this date */}
                  <div className="space-y-1.5 my-1 overflow-hidden">
                    {cell.sessions.slice(0, 2).map((session) => {
                      const matchedClass = classes.find((c) => c.id === session.classId);
                      const clsName = session.className || matchedClass?.name || 'Lớp học';
                      const theme = getClassTheme(session.classId, classes);
                      const isCompleted = session.status === 'completed';
                      const isCancelled = session.status === 'cancelled';
                      const is1on1 = session.isIndividualTutoring;

                      return (
                        <div
                          key={session.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSessionDetail(session);
                          }}
                          className={`text-[10px] sm:text-[11px] font-bold p-1.5 rounded-lg border transition-all hover:scale-[1.02] shadow-2xs cursor-pointer ${
                            isCancelled
                              ? 'bg-slate-100 text-slate-500 border-slate-200 line-through opacity-60'
                              : is1on1
                              ? 'bg-amber-50 text-amber-950 border-amber-300 ring-1 ring-amber-400/70'
                              : `${theme.chipBg} ${theme.chipText} ${theme.chipBorder}`
                          }`}
                          title={
                            is1on1
                              ? `[Kèm 1-1: ${session.studentName}] ${session.title} (${session.startTime} - ${session.endTime})`
                              : `[${clsName}] Buổi ${session.sessionNumber}: ${session.title} (${session.startTime} - ${session.endTime})`
                          }
                        >
                          {/* Row 1: Class Name & Time & Status Badge */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1 min-w-0 truncate">
                              {is1on1 ? (
                                <span className="text-[10px] shrink-0">⭐</span>
                              ) : (
                                <span className={`w-2 h-2 rounded-full shrink-0 ${theme.dot}`} />
                              )}
                              <span className="font-black text-[10px] sm:text-[11px] truncate tracking-tight uppercase">
                                {is1on1 ? `Kèm: ${session.studentName || 'Học viên'}` : clsName}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {isCompleted && (
                                <span
                                  className="px-1 py-0.2 rounded bg-emerald-600 text-white text-[8px] font-black"
                                  title="Đã hoàn thành"
                                >
                                  ✓
                                </span>
                              )}
                              <span className="font-mono text-[9px] opacity-90 font-bold">
                                {session.startTime}
                              </span>
                            </div>
                          </div>

                          {/* Row 2: Session Number / Topic Title */}
                          <div className="text-[9px] opacity-85 truncate mt-0.5 flex items-center gap-1">
                            {!is1on1 && (
                              <span className="px-1 py-0.2 rounded bg-black/10 text-current font-black font-mono shrink-0 text-[8px]">
                                B{session.sessionNumber}
                              </span>
                            )}
                            <span className="truncate font-medium">{session.title}</span>
                          </div>
                        </div>
                      );
                    })}

                    {cell.sessions.length > 2 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDateStr(cell.dateStr);
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 px-1 pt-0.5 cursor-pointer flex items-center justify-between"
                      >
                        <span>+ {cell.sessions.length - 2} ca học khác...</span>
                        <span className="text-[9px] font-mono text-slate-400">Xem tất cả →</span>
                      </div>
                    )}
                  </div>

                  {/* Footer hint */}
                  <div className="text-[9px] text-slate-400 flex items-center justify-between">
                    {hasSessions && (
                      <span className="font-bold text-slate-500 font-mono">
                        {cell.sessions.length} buổi học
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW 2: LIST / TIMETABLE AGENDA VIEW (CHRONOLOGICAL GROUPING) */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Danh Sách Lịch Giảng Dạy Chi Tiết Theo Ngày & Giờ</span>
            </h4>
            <span className="text-xs font-mono text-slate-500">
              Tổng cộng {schedules.length} buổi học
            </span>
          </div>

          {Object.keys(sessionsByDate).length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">Chưa có buổi học nào được xếp lịch.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.keys(sessionsByDate)
                .sort()
                .map((dateKey) => {
                  const daySessions = sessionsByDate[dateKey];
                  const dayObj = new Date(dateKey);
                  const isToday = dateKey === todayStr;

                  return (
                    <div
                      key={dateKey}
                      className={`rounded-2xl border p-4 transition-all ${
                        isToday
                          ? 'border-blue-300 bg-blue-50/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      {/* Date Row Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-lg font-mono ${
                              isToday
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-white'
                            }`}
                          >
                            {dayObj.toLocaleDateString('vi-VN', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                          {isToday && (
                            <span className="text-[11px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                              Hôm nay
                            </span>
                          )}
                          <span className="text-xs font-semibold text-slate-600">
                            {daySessions.length} ca học
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenCreateSession(dateKey)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>+ Thêm ca khác vào ngày này</span>
                        </button>
                      </div>

                      {/* Sessions within this date */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {daySessions.map((session) => {
                          const theme = getClassTheme(session.classId, classes);
                          return (
                            <div
                              key={session.id}
                              onClick={() => setSelectedSessionDetail(session)}
                              className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {session.isIndividualTutoring ? (
                                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold text-[10px] flex items-center gap-1 shadow-2xs">
                                      ⭐ KÈM 1-1: {session.studentName || 'Học viên'}
                                    </span>
                                  ) : (
                                    <>
                                      <ClassBadge
                                        classId={session.classId}
                                        classNameStr={session.className}
                                        classes={classes}
                                        size="sm"
                                      />
                                      <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-[10px] font-bold rounded-md">
                                        B{session.sessionNumber}
                                      </span>
                                    </>
                                  )}
                                  {session.skillFocus && (
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-100">
                                      🎯 {session.skillFocus}
                                    </span>
                                  )}
                                </div>

                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    session.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : session.status === 'cancelled'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {session.status === 'completed' ? '✓ Đã học' :
                                   session.status === 'cancelled' ? '✕ Đã hủy' : '⏳ Sắp diễn ra'}
                                </span>
                              </div>

                              <h5 className="text-xs font-bold text-slate-900 leading-snug">
                                {session.title}
                              </h5>

                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                                <span className="flex items-center gap-1 text-slate-700 font-bold">
                                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                                  {session.startTime} - {session.endTime}
                                </span>
                                {session.roomOrLink && (
                                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                    {session.roomOrLink}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: CHI TIẾT TẤT CẢ CÁC BUỔI TRONG NGÀY ĐƯỢC CHỌN (MULTI-SESSION)
      ========================================================================= */}
      {selectedDateStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Lịch Học Ngày: {new Date(selectedDateStr).toLocaleDateString('vi-VN')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tổng cộng {selectedDateSessions.length} ca học đã xếp lịch cho ngày này
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1">
              {selectedDateSessions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <p className="text-xs">Chưa có buổi học nào vào ngày này.</p>
                </div>
              ) : (
                selectedDateSessions.map((session) => {
                  const theme = getClassTheme(session.classId, classes);
                  return (
                    <div
                      key={session.id}
                      onClick={() => {
                        setSelectedDateStr(null);
                        setSelectedSessionDetail(session);
                      }}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer space-y-2 bg-white"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ClassBadge
                            classId={session.classId}
                            classNameStr={session.className}
                            classes={classes}
                            size="sm"
                          />
                          <span className="px-2 py-0.5 bg-slate-900 text-white font-mono text-xs font-bold rounded-md">
                            Buổi {session.sessionNumber}
                          </span>
                          {session.skillFocus && (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100">
                              🎯 {session.skillFocus}
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            session.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : session.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {session.status === 'completed' ? '✓ Đã hoàn thành' :
                           session.status === 'cancelled' ? '✕ Đã hủy' : '⏳ Sắp diễn ra'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900">{session.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">{session.topic}</p>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 font-mono">
                        <span className="flex items-center gap-1 font-bold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          {session.startTime} - {session.endTime}
                        </span>
                        {session.roomOrLink && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            {session.roomOrLink}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const targetDate = selectedDateStr;
                  setSelectedDateStr(null);
                  onOpenCreateSession(targetDate);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Thêm Buổi Học Khác Vào Ngày Này</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: CHI TIẾT CỤ THỂ 1 BUỔI HỌC
      ========================================================================= */}
      {selectedSessionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            
            {/* Header with Title & Badges */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg shadow-2xs">
                    Buổi {selectedSessionDetail.sessionNumber}
                  </span>
                  
                  {/* Distinct Class Color Tag */}
                  <ClassBadge
                    classId={selectedSessionDetail.classId}
                    classNameStr={selectedSessionDetail.className}
                    classes={classes}
                    size="md"
                  />

                  {selectedSessionDetail.skillFocus && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 font-bold text-xs rounded-lg flex items-center gap-1">
                      <span>🎯</span>
                      <span>{selectedSessionDetail.skillFocus}</span>
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-1 font-bold text-xs rounded-lg ${
                      selectedSessionDetail.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedSessionDetail.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedSessionDetail.status === 'completed' ? '✓ Đã hoàn thành' :
                     selectedSessionDetail.status === 'cancelled' ? '✕ Đã hủy' : '⏳ Sắp diễn ra'}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedSessionDetail.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSessionDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Information */}
            <div className="overflow-y-auto py-5 space-y-4 flex-1 text-xs">
              
              {/* Date, Time & Location Banner */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    THỜI GIAN DIỄN RA
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                    <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{new Date(selectedSessionDetail.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold font-mono text-xs">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{selectedSessionDetail.startTime} - {selectedSessionDetail.endTime}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    ĐỊA ĐIỂM / LINK HỌC
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate">{selectedSessionDetail.roomOrLink || 'Chưa cập nhật phòng học'}</span>
                  </div>
                </div>
              </div>

              {/* Syllabus & Topic */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  📖 NỘI DUNG & KIẾN THỨC TRỌNG TÂM
                </span>
                <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-2xl text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedSessionDetail.topic}
                </div>
              </div>

              {/* Homework */}
              {selectedSessionDetail.homeworkSummary && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                    📝 BÀI TẬP VỀ NHÀ CẦN HOÀN THÀNH
                  </span>
                  <div className="p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-2xl text-amber-900 leading-relaxed whitespace-pre-line flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{selectedSessionDetail.homeworkSummary}</span>
                  </div>
                </div>
              )}

              {/* Pedagogical notes */}
              {selectedSessionDetail.notes && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                    💡 GHI CHÚ SƯ PHẠM
                  </span>
                  <div className="p-3.5 bg-indigo-50/60 border border-indigo-200/70 rounded-2xl text-indigo-950 italic flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{selectedSessionDetail.notes}</span>
                  </div>
                </div>
              )}

              {/* Slide / Materials Link */}
              {selectedSessionDetail.materialsUrl && (
                <div className="pt-2">
                  <a
                    href={selectedSessionDetail.materialsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Mở Slide Bài Giảng & Tài Liệu Buổi Học</span>
                  </a>
                </div>
              )}

            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedSessionDetail.status !== 'completed' ? (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleSessionStatus(selectedSessionDetail.id, 'completed');
                      setSelectedSessionDetail({ ...selectedSessionDetail, status: 'completed' });
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Đánh Dấu Hoàn Thành</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleSessionStatus(selectedSessionDetail.id, 'upcoming');
                      setSelectedSessionDetail({ ...selectedSessionDetail, status: 'upcoming' });
                    }}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Đổi Thành Chưa Học</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const session = selectedSessionDetail;
                    setSelectedSessionDetail(null);
                    onOpenEditSession(session);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sửa</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const session = selectedSessionDetail;
                    setSelectedSessionDetail(null);
                    onDeleteSession(session);
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSessionDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
