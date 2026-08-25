import React, { useState, useEffect } from 'react';
import { 
  X, 
  LayoutGrid, 
  Calendar, 
  GraduationCap, 
  Target, 
  Users, 
  CheckCircle2,
  Sparkles,
  Palette,
  Check,
  Search,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { ClassGroup, Student } from '../types';
import { CLASS_COLOR_THEMES, COLOR_KEYS, getClassTheme } from '../utils/classColors';
import { ClassBadge } from './ClassBadge';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToEdit?: ClassGroup | null;
  allStudents?: Student[];
  onSaveClass: (classData: ClassGroup, enrolledStudentIds?: string[]) => void;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  classToEdit,
  allStudents = [],
  onSaveClass,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('INT-88');
  const [level, setLevel] = useState('Target Band 6.5 - 7.0');
  const [schedule, setSchedule] = useState('T3 - T5 - T7 (18:00 - 20:00)');
  const [teacherName, setTeacherName] = useState('Teacher Celina Phạm (IELTS 8.5)');
  const [averageBand, setAverageBand] = useState<number>(6.5);
  const [color, setColor] = useState<string>('indigo');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  useEffect(() => {
    if (classToEdit) {
      setName(classToEdit.name);
      setCode(classToEdit.code || (classToEdit.name.toUpperCase().includes('INTENSIVE') ? 'INT-88' : classToEdit.name.toUpperCase().includes('FOUNDATION') ? 'FND-12' : 'MAS-75'));
      setLevel(classToEdit.level);
      setSchedule(classToEdit.schedule);
      setTeacherName(classToEdit.teacherName);
      setAverageBand(classToEdit.averageBand);
      setColor(classToEdit.color || 'indigo');
      // Pre-select students enrolled in this class
      const enrolled = allStudents
        .filter((s) => s.classId === classToEdit.id || (s.classIds && s.classIds.includes(classToEdit.id)))
        .map((s) => s.id);
      setSelectedStudentIds(enrolled);
    } else {
      setName('');
      setCode('INT-88');
      setLevel('Target Band 6.5 - 7.0');
      setSchedule('T3 - T5 - T7 (18:00 - 20:00)');
      setTeacherName('Teacher Celina Phạm (IELTS 8.5)');
      setAverageBand(6.5);
      setColor('indigo');
      setSelectedStudentIds([]);
    }
    setStudentSearchQuery('');
  }, [classToEdit, isOpen, allStudents]);

  if (!isOpen) return null;

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudentIds(filteredStudents.map((s) => s.id));
  };

  const deselectAllStudents = () => {
    setSelectedStudentIds([]);
  };

  const filteredStudents = allStudents.filter((s) => {
    const q = studentSearchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.phone && s.phone.includes(q));
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const savedClass: ClassGroup = {
      id: classToEdit ? classToEdit.id : `class-${Date.now()}`,
      code: code.trim().toUpperCase() || 'IEL-01',
      name: name.trim(),
      level: level.trim(),
      schedule: schedule.trim(),
      studentCount: selectedStudentIds.length || (classToEdit ? classToEdit.studentCount : 0),
      averageBand: Number(averageBand),
      teacherName: teacherName.trim(),
      color: color || 'indigo',
    };

    onSaveClass(savedClass, selectedStudentIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {classToEdit ? 'Chỉnh Sửa Thông Tin Lớp Học' : 'Tạo Lớp Học IELTS Mới'}
              </h3>
              <p className="text-xs text-slate-500">
                Thiết lập tag màu lớp riêng biệt, mã lớp, lịch giảng dạy và gán học viên vào lớp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên Lớp Học *
              </label>
              <input
                type="text"
                required
                placeholder="vd: IELTS Intensive K88"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Lớp (Badge) *
              </label>
              <input
                type="text"
                required
                placeholder="vd: INT-88, FND-12"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-bold text-slate-900 uppercase font-mono"
              />
            </div>
          </div>

          {/* Color Tag Selector & Live Preview */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>Tag Màu Riêng Biệt Cho Lớp Học:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Xem trước:</span>
                <ClassBadge
                  classNameStr={name || 'Tên Lớp Học'}
                  classCode={code || 'TAG'}
                  color={color}
                  size="sm"
                />
              </div>
            </div>

            {/* Color Swatches Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
              {COLOR_KEYS.map((key) => {
                const theme = CLASS_COLOR_THEMES[key];
                const isSelected = color === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColor(key)}
                    title={theme.name}
                    className={`h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border-2 relative ${
                      isSelected
                        ? 'ring-2 ring-blue-500 scale-105 shadow-xs border-white'
                        : 'border-transparent hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: theme.hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />}
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-500 text-right">
              Đang chọn: <span className="font-bold text-slate-800">{CLASS_COLOR_THEMES[color]?.name || color}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lộ Trình / Trình Độ Mục Tiêu
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
              >
                <option value="Target Band 5.0 - 5.5">IELTS Foundation (5.0 - 5.5)</option>
                <option value="Target Band 6.0 - 6.5">IELTS Pre-Intensive (6.0 - 6.5)</option>
                <option value="Target Band 6.5 - 7.0">IELTS Intensive (6.5 - 7.0+)</option>
                <option value="Target Band 7.5 - 8.0">IELTS Master (7.5 - 8.0+)</option>
                <option value="IELTS Speaking & Writing Focus">Speaking & Writing Chuyên Sâu</option>
                <option value="IELTS General Training">IELTS General Training Định Cư</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Band Trung Bình
              </label>
              <select
                value={averageBand}
                onChange={(e) => setAverageBand(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold text-blue-700"
              >
                <option value={5.5}>Band 5.5</option>
                <option value={6.0}>Band 6.0</option>
                <option value={6.5}>Band 6.5</option>
                <option value={7.0}>Band 7.0</option>
                <option value={7.5}>Band 7.5</option>
                <option value={8.0}>Band 8.0</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lịch Học Trong Tuần *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                placeholder="vd: Thứ 2, 4, 6 (19:30 - 21:30) hoặc Thứ 7, CN (14:00 - 16:30)"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Giảng Viên / Trợ Giảng Phụ Trách
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="vd: Teacher Celina Phạm (IELTS 8.5) & TA Minh Đức"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* ADD EXISTING STUDENTS SECTION (GHI DANH HỌC VIÊN ĐÃ CÓ SẴN) */}
          <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Ghi Danh Học Viên Sẵn Có Vào Lớp Này
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    1 học viên có thể học đồng thời 2 hoặc nhiều lớp
                  </p>
                </div>
              </div>

              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-lg">
                Đã chọn: {selectedStudentIds.length} học viên
              </span>
            </div>

            {/* Student Search & Quick Select */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm học viên theo tên, email..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <button
                type="button"
                onClick={selectAllStudents}
                className="px-2 py-1.5 text-[10px] font-bold bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                onClick={deselectAllStudents}
                className="px-2 py-1.5 text-[10px] font-bold bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg cursor-pointer whitespace-nowrap"
              >
                Bỏ chọn
              </button>
            </div>

            {/* Student list checkboxes */}
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 bg-white p-2 rounded-xl border border-slate-200">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  Không tìm thấy học viên phù hợp
                </div>
              ) : (
                filteredStudents.map((st) => {
                  const isChecked = selectedStudentIds.includes(st.id);
                  const otherClasses = st.classNames || [st.className];

                  return (
                    <label
                      key={st.id}
                      onClick={() => toggleStudentSelection(st.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-300'
                          : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent label
                          className="w-3.5 h-3.5 text-blue-600 rounded-md focus:ring-0 cursor-pointer shrink-0"
                        />
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {st.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {st.email}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className="text-[10px] font-bold text-indigo-600 block">
                          Band {st.currentEstimatedBand || st.targetBand}
                        </span>
                        <span className="text-[9px] text-slate-400 block truncate max-w-[120px]" title={otherClasses.join(', ')}>
                          {otherClasses[0] || 'Lớp khác'}
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick presets for schedule */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Gợi ý lịch học phổ biến:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Thứ 2, 4, 6 (19:30 - 21:30)',
                'Thứ 3, 5, 7 (18:00 - 20:00)',
                'Thứ 7 & CN (14:00 - 16:30)',
                'Thứ 7 & CN (09:00 - 11:30)',
              ].map((sch, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSchedule(sch)}
                  className="px-2 py-1 text-[11px] bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  {sch}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{classToEdit ? 'Lưu Thông Tin Lớp' : 'Tạo Lớp Học Mới'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

