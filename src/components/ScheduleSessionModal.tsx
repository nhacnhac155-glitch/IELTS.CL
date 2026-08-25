import React, { useState, useEffect } from 'react';
import { ClassGroup, ClassScheduleSession, Student } from '../types';
import { X, Calendar, Clock, BookOpen, Link, FileText, CheckCircle2, AlertCircle, MapPin, Sparkles, User, Star } from 'lucide-react';

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassGroup[];
  selectedClassId?: string;
  defaultClassId?: string;
  sessionToEdit?: ClassScheduleSession | null;
  initialDate?: string;
  students?: Student[];
  onSaveSession: (session: ClassScheduleSession) => void;
}

export const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({
  isOpen,
  onClose,
  classes,
  selectedClassId,
  defaultClassId,
  sessionToEdit,
  initialDate,
  students = [],
  onSaveSession,
}) => {
  const [classId, setClassId] = useState<string>('');
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [skillFocus, setSkillFocus] = useState<ClassScheduleSession['skillFocus']>('Writing');
  const [materialsUrl, setMaterialsUrl] = useState('');
  const [homeworkSummary, setHomeworkSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ClassScheduleSession['status']>('upcoming');
  const [roomOrLink, setRoomOrLink] = useState('');
  
  // 1:1 Individual Tutoring state
  const [isIndividualTutoring, setIsIndividualTutoring] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState('');
  const [tutoringGoal, setTutoringGoal] = useState('');

  useEffect(() => {
    if (sessionToEdit) {
      setClassId(sessionToEdit.classId);
      setSessionNumber(sessionToEdit.sessionNumber);
      setTitle(sessionToEdit.title);
      setTopic(sessionToEdit.topic);
      setDate(sessionToEdit.date);
      setStartTime(sessionToEdit.startTime);
      setEndTime(sessionToEdit.endTime);
      setSkillFocus(sessionToEdit.skillFocus);
      setMaterialsUrl(sessionToEdit.materialsUrl || '');
      setHomeworkSummary(sessionToEdit.homeworkSummary || '');
      setNotes(sessionToEdit.notes || '');
      setStatus(sessionToEdit.status);
      setRoomOrLink(sessionToEdit.roomOrLink || '');
      setIsIndividualTutoring(!!sessionToEdit.isIndividualTutoring);
      setTargetStudentId(sessionToEdit.studentId || '');
      setTutoringGoal(sessionToEdit.tutoringGoal || '');
    } else {
      const defaultClsId = defaultClassId || (selectedClassId !== 'all' && selectedClassId ? selectedClassId : (classes[0]?.id || ''));
      setClassId(defaultClsId);
      setSessionNumber(1);
      setTitle('');
      setTopic('');
      // Use initialDate if provided, otherwise default to today
      const defaultDate = initialDate || new Date().toISOString().split('T')[0];
      setDate(defaultDate);
      setStartTime('18:00');
      setEndTime('20:00');
      setSkillFocus('Writing');
      setMaterialsUrl('');
      setHomeworkSummary('');
      setNotes('');
      setStatus('upcoming');
      setRoomOrLink('Phòng học 302 - Cơ sở Quận 1');
      setIsIndividualTutoring(false);
      setTargetStudentId(students[0]?.id || '');
      setTutoringGoal('');
    }
  }, [sessionToEdit, isOpen, selectedClassId, defaultClassId, classes, initialDate, students]);

  if (!isOpen) return null;

  const handleStudentChange = (stId: string) => {
    setTargetStudentId(stId);
    const matched = students.find((s) => s.id === stId);
    if (matched && isIndividualTutoring && (!title || title.startsWith('Kèm 1:1') || title.startsWith('⭐ Phụ đạo 1:1'))) {
      setTitle(`⭐ Kèm 1:1: ${matched.name} - Bổ trợ ${skillFocus}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !classId) return;

    const matchedClass = classes.find((c) => c.id === classId);
    const className = matchedClass ? matchedClass.name : 'Lớp học';
    const matchedStudent = students.find((s) => s.id === targetStudentId);

    const sessionData: ClassScheduleSession = {
      id: sessionToEdit ? sessionToEdit.id : `sch-${Date.now()}`,
      classId,
      className,
      sessionNumber: Number(sessionNumber) || 1,
      title: title.trim(),
      topic: topic.trim() || (isIndividualTutoring ? `Kèm riêng 1:1 học viên ${matchedStudent?.name || ''}` : 'Nội dung buổi học'),
      date,
      startTime,
      endTime,
      skillFocus,
      materialsUrl: materialsUrl.trim() || undefined,
      homeworkSummary: homeworkSummary.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
      roomOrLink: roomOrLink.trim() || undefined,
      isIndividualTutoring,
      studentId: isIndividualTutoring ? targetStudentId : undefined,
      studentName: isIndividualTutoring ? (matchedStudent?.name || undefined) : undefined,
      studentAvatar: isIndividualTutoring ? (matchedStudent?.avatar || undefined) : undefined,
      tutoringGoal: isIndividualTutoring ? tutoringGoal.trim() : undefined,
    };

    onSaveSession(sessionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isIndividualTutoring ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
            }`}>
              {isIndividualTutoring ? <Star className="w-5 h-5 fill-amber-400 text-amber-500" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {sessionToEdit 
                  ? (sessionToEdit.isIndividualTutoring ? 'Chỉnh Sửa Ca Hẹn 1:1' : 'Chỉnh Sửa Buổi Học') 
                  : (isIndividualTutoring ? 'Đặt Lịch Ca Hẹn Kèm 1:1 Cho Học Sinh' : 'Lên Lịch & Nội Dung Buổi Học Mới')}
              </h2>
              <p className="text-xs text-slate-500">
                {isIndividualTutoring 
                  ? 'Ca phụ đạo riêng 1:1 tăng cường kỹ năng yếu cho học sinh' 
                  : 'Thời khóa biểu chi tiết, nội dung bài giảng & giao bài tập'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* TOGGLE 1:1 INDIVIDUAL TUTORING */}
          <div className="p-3 bg-linear-to-r from-amber-50/90 to-orange-50/70 rounded-xl border border-amber-200/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Star className="w-4 h-4 fill-white" />
              </div>
              <div>
                <p className="font-bold text-amber-950 text-xs">
                  Ca Hẹn Phụ Đạo Riêng 1:1 (Individual Tutoring)
                </p>
                <p className="text-[11px] text-amber-800/80">
                  Hiển thị nổi bật riêng trên lịch học của giáo viên & học viên
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isIndividualTutoring}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsIndividualTutoring(checked);
                  if (checked && students.length > 0) {
                    const st = students.find((s) => s.id === targetStudentId) || students[0];
                    setTargetStudentId(st.id);
                    setTitle(`⭐ Kèm 1:1: ${st.name} - Bổ trợ ${skillFocus}`);
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* 1:1 Student Selector & Tutoring Goal */}
          {isIndividualTutoring && (
            <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-300/80 space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-amber-950 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chọn Học Sinh Kèm 1:1 *</span>
                  </label>
                  <select
                    value={targetStudentId}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    required={isIndividualTutoring}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900 focus:outline-hidden"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.className} - Band {st.currentEstimatedBand || st.targetBand})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-amber-950 mb-1">
                    Mục Tiêu Kèm Riêng
                  </label>
                  <input
                    type="text"
                    placeholder="vd: Sửa lỗi phát âm âm đuôi & phản xạ Speaking"
                    value={tutoringGoal}
                    onChange={(e) => setTutoringGoal(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Row 1: Class & Session Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Áp dụng cho Lớp học *
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 focus:outline-hidden"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    [{cls.code || 'LỚP'}] {cls.name} ({cls.schedule})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Thứ tự Buổi học *
              </label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={sessionNumber}
                onChange={(e) => setSessionNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Row 2: Title & Skill Focus */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Tên Chủ Đề Buổi Học *
              </label>
              <input
                type="text"
                required
                placeholder="vd: Writing Task 2: Dạng bài Opinion / Agree or Disagree"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trọng Tâm Kỹ Năng *
              </label>
              <select
                value={skillFocus}
                onChange={(e) => setSkillFocus(e.target.value as any)}
                className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-indigo-700 focus:outline-hidden"
              >
                <option value="Writing">Writing</option>
                <option value="Speaking">Speaking</option>
                <option value="Reading">Reading</option>
                <option value="Listening">Listening</option>
                <option value="All-skills">Tổng Hợp 4 Kỹ Năng</option>
                <option value="Grammar & Vocab">Grammar & Vocabulary</option>
                <option value="Mock Test">Mock Test / Thi Thử</option>
              </select>
            </div>
          </div>

          {/* Row 3: Date, Start Time, End Time */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ngày học *</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bắt đầu *</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kết thúc *</span>
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            {/* Quick time slot presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-slate-500 font-semibold">Khung giờ nhanh:</span>
              {[
                { label: 'Sáng 08:30 - 10:30', start: '08:30', end: '10:30' },
                { label: 'Chiều 14:00 - 16:30', start: '14:00', end: '16:30' },
                { label: 'Tối 18:00 - 20:00', start: '18:00', end: '20:00' },
                { label: 'Tối muộn 19:30 - 21:30', start: '19:30', end: '21:30' },
              ].map((slot, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setStartTime(slot.start);
                    setEndTime(slot.end);
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-mono transition-colors cursor-pointer ${
                    startTime === slot.start && endTime === slot.end
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Detailed Lesson Topics */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Nội Dung Chi Tiết Buổi Học (Grammar, Lexicon, Strategies) *</span>
              <span className="text-[10px] text-slate-400 font-normal">Học viên sẽ xem phần này để chuẩn bị bài</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="vd: 1. Phân tích đề bài và lập dàn ý 4 đoạn. 2. Các liên từ nâng cao (Furthermore, In contrast, Nonetheless). 3. Luyện viết 2 đoạn thân bài với ví dụ thực tế."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-normal text-slate-800 focus:outline-hidden leading-relaxed"
            />
          </div>

          {/* Row 5: Room/Link & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Địa điểm / Link Học Online</span>
              </label>
              <input
                type="text"
                placeholder="vd: Phòng 302 - Cơ sở Q1 hoặc Zoom: 889 1234 5678"
                value={roomOrLink}
                onChange={(e) => setRoomOrLink(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trạng thái buổi học
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 focus:outline-hidden"
              >
                <option value="upcoming">Sắp diễn ra</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy / Nghỉ lễ</option>
              </select>
            </div>
          </div>

          {/* Row 6: Materials URL & Homework Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Link className="w-3.5 h-3.5 text-slate-400" />
                <span>Link Slide / Tài Liệu Buổi Học</span>
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={materialsUrl}
                onChange={(e) => setMaterialsUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Tóm Tắt Bài Tập Về Nhà</span>
              </label>
              <input
                type="text"
                placeholder="vd: Viết bài Task 2 nộp trong mục Bài Tập"
                value={homeworkSummary}
                onChange={(e) => setHomeworkSummary(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Row 7: Teacher Pedagogical Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ghi Chú Sư Phạm (Dành cho Giáo viên)
            </label>
            <input
              type="text"
              placeholder="vd: Nhắc học sinh mang theo tài liệu Unit 4 và kiểm tra bài cũ bạn Nam"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-amber-50/50 border border-amber-200/80 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800 focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                isIndividualTutoring ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{sessionToEdit ? 'Cập Nhật Buổi Học' : (isIndividualTutoring ? 'Lưu Ca Kèm 1:1' : 'Lưu & Thêm Vào Thời Khóa Biểu')}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

