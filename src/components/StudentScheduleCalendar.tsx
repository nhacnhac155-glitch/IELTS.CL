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
  X
} from 'lucide-react';
import { ClassScheduleSession } from '../types';
import { getClassTheme } from '../utils/classColors';

interface StudentScheduleCalendarProps {
  className: string;
  schedules: ClassScheduleSession[];
}

export const StudentScheduleCalendar: React.FC<StudentScheduleCalendarProps> = ({
  className,
  schedules,
}) => {
  // Calendar month navigation state
  const [currentDate, setCurrentDate] = useState(() => {
    const firstUpcoming = schedules.find((s) => s.status === 'upcoming') || schedules[0];
    if (firstUpcoming && firstUpcoming.date) {
      const d = new Date(firstUpcoming.date);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<ClassScheduleSession | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const daysOfWeek = ['T2 (Thứ 2)', 'T3 (Thứ 3)', 'T4 (Thứ 4)', 'T5 (Thứ 5)', 'T6 (Thứ 6)', 'T7 (Thứ 7)', 'CN (Chủ Nhật)'];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const firstDayOfMonth = new Date(year, month, 1);
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  interface CalendarDayCell {
    dateStr: string;
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

  const sessionsByDate: Record<string, ClassScheduleSession[]> = {};
  schedules.forEach((sch) => {
    if (!sessionsByDate[sch.date]) {
      sessionsByDate[sch.date] = [];
    }
    sessionsByDate[sch.date].push(sch);
  });

  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    const dStr = formatToYYYYMMDD(d);
    calendarDays.push({
      dateStr: dStr,
      dayNumber: daysInPrevMonth - i,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      sessions: sessionsByDate[dStr] || [],
    });
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dStr = formatToYYYYMMDD(d);
    calendarDays.push({
      dateStr: dStr,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dStr === todayStr,
      sessions: sessionsByDate[dStr] || [],
    });
  }

  // Next month padding
  const totalSlots = calendarDays.length <= 35 ? 35 : 42;
  const nextMonthCount = totalSlots - calendarDays.length;
  for (let i = 1; i <= nextMonthCount; i++) {
    const d = new Date(year, month + 1, i);
    const dStr = formatToYYYYMMDD(d);
    calendarDays.push({
      dateStr: dStr,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dStr === todayStr,
      sessions: sessionsByDate[dStr] || [],
    });
  }

  const selectedDateSessions = selectedDateStr ? sessionsByDate[selectedDateStr] || [] : [];

  return (
    <div className="space-y-4">
      {/* Calendar Header Navigation */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{monthNames[month]}</span>
              <span className="text-blue-600 font-mono">Năm {year}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold ml-1">
                Lớp {className}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Nhấp vào từng ngày trên lịch để xem nội dung bài học, tài liệu slide và bài tập
            </p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2">
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

      {/* Main Monthly Calendar Grid */}
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

            return (
              <div
                key={`${cell.dateStr}-${idx}`}
                onClick={() => {
                  if (hasSessions) {
                    if (cell.sessions.length === 1) {
                      setSelectedSessionDetail(cell.sessions[0]);
                    } else {
                      setSelectedDateStr(cell.dateStr);
                    }
                  }
                }}
                className={`min-h-[95px] sm:min-h-[120px] p-1.5 sm:p-2.5 transition-all flex flex-col justify-between ${
                  hasSessions ? 'cursor-pointer hover:bg-blue-50/50' : 'cursor-default'
                } ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/60 text-slate-400'
                } ${cell.isToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/20' : ''}`}
              >
                {/* Header: Day number */}
                <div className="flex items-center justify-between">
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

                  {hasSessions && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  )}
                </div>

                {/* Sessions in day */}
                <div className="space-y-1.5 my-1 overflow-hidden">
                  {cell.sessions.slice(0, 2).map((session) => {
                    const clsName = session.className || className || 'Lớp IELTS';
                    const theme = getClassTheme(session.classId || clsName);
                    const isCompleted = session.status === 'completed';
                    const is1on1 = session.isIndividualTutoring;

                    return (
                      <div
                        key={session.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSessionDetail(session);
                        }}
                        className={`text-[10px] sm:text-[11px] font-bold p-1.5 rounded-lg border transition-all hover:scale-[1.02] shadow-2xs cursor-pointer ${
                          is1on1
                            ? 'bg-amber-50 text-amber-950 border-amber-300 ring-1 ring-amber-400/70'
                            : `${theme.chipBg} ${theme.chipText} ${theme.chipBorder}`
                        }`}
                        title={is1on1 ? `[Kèm 1-1] ${session.title}` : `[${clsName}] Buổi ${session.sessionNumber}: ${session.title} (${session.startTime} - ${session.endTime})`}
                      >
                        {/* Row 1: Class Name & Start Time & Status */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1 min-w-0 truncate">
                            {is1on1 ? (
                              <span className="text-[10px] shrink-0">⭐</span>
                            ) : (
                              <span className={`w-2 h-2 rounded-full shrink-0 ${theme.dot}`} />
                            )}
                            <span className="font-black text-[10px] sm:text-[11px] truncate tracking-tight uppercase">
                              {is1on1 ? 'Kèm 1-1' : clsName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isCompleted && (
                              <span className="px-1 py-0.2 rounded bg-emerald-600 text-white text-[8px] font-black" title="Đã hoàn thành">
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
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 px-1 pt-0.5 cursor-pointer"
                    >
                      + {cell.sessions.length - 2} buổi khác...
                    </div>
                  )}
                </div>

                {/* Footer hint */}
                <div className="text-[9px] text-slate-400 flex items-center justify-between">
                  {hasSessions && (
                    <span className="font-bold text-blue-600">
                      {cell.sessions.length} buổi học
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL 1: Ngày nhiều buổi */}
      {selectedDateStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Lịch Học Ngày {new Date(selectedDateStr).toLocaleDateString('vi-VN')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nhấp vào một buổi học để xem chi tiết bài giảng và tài liệu
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
              {selectedDateSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedDateStr(null);
                    setSelectedSessionDetail(session);
                  }}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer space-y-2 bg-white"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
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
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {session.status === 'completed' ? '✓ Đã học' : '⏳ Sắp diễn ra'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{session.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{session.topic}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 font-mono">
                    <span className="flex items-center gap-1">
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
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDateStr(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: CHI TIẾT CỤ THỂ 1 BUỔI HỌC CHO HỌC VIÊN */}
      {selectedSessionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-bold text-xs rounded-lg shadow-2xs">
                    Buổi {selectedSessionDetail.sessionNumber}
                  </span>
                  
                  {/* Class Badge & Class Code */}
                  {(() => {
                    const classCode = (
                      selectedSessionDetail.className.toLowerCase().includes('intensive') ? 'INT-88' :
                      selectedSessionDetail.className.toLowerCase().includes('foundation') ? 'FND-12' :
                      selectedSessionDetail.className.toLowerCase().includes('master') ? 'MAS-75' : 'IEL-01'
                    );

                    return (
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-xs rounded-lg flex items-center gap-1.5">
                        <span>{selectedSessionDetail.className}</span>
                        <span className="px-1.5 py-0.2 text-[10px] bg-indigo-600 text-white rounded-md font-mono font-bold">
                          {classCode}
                        </span>
                      </span>
                    );
                  })()}

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
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedSessionDetail.status === 'completed' ? '✓ Đã học' : '⏳ Sắp diễn ra'}
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

            <div className="overflow-y-auto py-5 space-y-4 flex-1 text-xs">
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    THỜI GIAN
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

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  📖 NỘI DUNG & KIẾN THỨC BÀI HỌC
                </span>
                <div className="p-3.5 bg-slate-50/80 border border-slate-200/70 rounded-2xl text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedSessionDetail.topic}
                </div>
              </div>

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

              {selectedSessionDetail.materialsUrl && (
                <div className="pt-2">
                  <a
                    href={selectedSessionDetail.materialsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Mở Slide Bài Giảng & Tài Liệu Buổi Học</span>
                  </a>
                </div>
              )}

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSessionDetail(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
