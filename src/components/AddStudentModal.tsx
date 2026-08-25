import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  UserPlus, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Target, 
  Sparkles,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  CheckCircle2,
  FileText,
  KeyRound,
  Calendar,
  CalendarDays,
  Upload,
  Camera,
  Link2
} from 'lucide-react';
import { ClassGroup, Student } from '../types';
import { roundIELTSBand } from '../utils/formatters';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassGroup[];
  defaultClassId?: string;
  studentToEdit?: Student | null;
  onSaveStudent: (student: Student, accountCredentials?: { username: string; password: string }) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  classes,
  defaultClassId,
  studentToEdit,
  onSaveStudent,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [targetBand, setTargetBand] = useState<number>(7.0);
  const [readingScore, setReadingScore] = useState<number>(6.5);
  const [listeningScore, setListeningScore] = useState<number>(6.5);
  const [writingScore, setWritingScore] = useState<number>(6.0);
  const [speakingScore, setSpeakingScore] = useState<number>(6.0);
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          setAvatar(base64Url);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [joinedDate, setJoinedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [expectedEndDate, setExpectedEndDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      setEmail(studentToEdit.email);
      setPhone(studentToEdit.phone || '');
      const existingIds = studentToEdit.classIds && studentToEdit.classIds.length > 0
        ? studentToEdit.classIds
        : [studentToEdit.classId];
      setSelectedClassIds(existingIds);
      setTargetBand(studentToEdit.targetBand);
      setReadingScore(studentToEdit.skillScores.reading);
      setListeningScore(studentToEdit.skillScores.listening);
      setWritingScore(studentToEdit.skillScores.writing);
      setSpeakingScore(studentToEdit.skillScores.speaking);
      setAvatar(studentToEdit.avatar);
      setJoinedDate(studentToEdit.joinedDate || new Date().toISOString().split('T')[0]);
      setExpectedEndDate(studentToEdit.expectedEndDate || (() => {
        const d = new Date(studentToEdit.joinedDate || Date.now());
        d.setMonth(d.getMonth() + 3);
        return d.toISOString().split('T')[0];
      })());
      setNotes(studentToEdit.notes || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setUsername('');
      setPassword('123');
      const initialCls = defaultClassId || classes[0]?.id || '';
      setSelectedClassIds(initialCls ? [initialCls] : []);
      setTargetBand(7.0);
      setReadingScore(6.5);
      setListeningScore(6.5);
      setWritingScore(6.0);
      setSpeakingScore(6.0);
      setAvatar(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]);
      const today = new Date().toISOString().split('T')[0];
      setJoinedDate(today);
      const endD = new Date();
      endD.setMonth(endD.getMonth() + 3);
      setExpectedEndDate(endD.toISOString().split('T')[0]);
      setNotes('');
    }
  }, [studentToEdit, defaultClassId, isOpen, classes]);

  if (!isOpen) return null;

  const toggleClassSelection = (clsId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(clsId)
        ? prev.length > 1
          ? prev.filter((id) => id !== clsId)
          : prev // Keep at least one class
        : [...prev, clsId]
    );
  };

  const currentEstimated = roundIELTSBand((readingScore + listeningScore + writingScore + speakingScore) / 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const primaryClassId = selectedClassIds[0] || classes[0]?.id || 'cls-1';
    const primaryClass = classes.find((c) => c.id === primaryClassId) || classes[0];
    const enrolledClassNames = selectedClassIds
      .map((id) => classes.find((c) => c.id === id)?.name)
      .filter(Boolean) as string[];

    const studentData: Student = {
      id: studentToEdit ? studentToEdit.id : `std-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '0912 345 678',
      avatar: avatar || AVATAR_PRESETS[0],
      classId: primaryClass ? primaryClass.id : 'cls-1',
      className: primaryClass ? primaryClass.name : 'IELTS Intensive 6.5+',
      classIds: selectedClassIds.length > 0 ? selectedClassIds : [primaryClassId],
      classNames: enrolledClassNames.length > 0 ? enrolledClassNames : [primaryClass ? primaryClass.name : 'IELTS Intensive 6.5+'],
      targetBand: Number(targetBand),
      currentEstimatedBand: currentEstimated,
      skillScores: {
        reading: Number(readingScore),
        listening: Number(listeningScore),
        writing: Number(writingScore),
        speaking: Number(speakingScore),
      },
      totalSubmissions: studentToEdit ? studentToEdit.totalSubmissions : 0,
      onTimeSubmissions: studentToEdit ? studentToEdit.onTimeSubmissions : 0,
      lateSubmissions: studentToEdit ? studentToEdit.lateSubmissions : 0,
      joinedDate: joinedDate || (studentToEdit ? studentToEdit.joinedDate : new Date().toISOString().split('T')[0]),
      expectedEndDate: expectedEndDate || undefined,
      notes: notes.trim() || 'Học viên mới tham gia lớp học. Cần theo dõi tiến độ tuần đầu.',
    };

    const generatedUsername = username.trim() || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || `hs_${Date.now().toString().slice(-4)}`;
    const finalPassword = password.trim() || '123';

    onSaveStudent(studentData, { username: generatedUsername, password: finalPassword });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {studentToEdit ? 'Chỉnh Sửa Thông Tin Học Sinh' : 'Thêm Học Sinh Vào Lớp Học'}
              </h3>
              <p className="text-xs text-slate-500">
                Nhập thông tin hồ sơ, lớp học và band điểm mục tiêu của học viên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Avatar Selector with File Upload & Presets */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Ảnh Đại Diện (Avatar Học Sinh)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh từ máy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Nhập Link ảnh</span>
                </button>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFile}
            />

            {/* Optional URL Input */}
            {showUrlInput && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="url"
                  placeholder="Dán đường dẫn ảnh (https://...)"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAvatarUrl.trim()) {
                      setAvatar(customAvatarUrl.trim());
                      setShowUrlInput(false);
                      setCustomAvatarUrl('');
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900 cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
            )}

            <div className="flex items-center gap-4 pt-1">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Bấm để tải ảnh mới">
                <img
                  src={avatar}
                  alt="Selected Avatar"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500 shadow-md ring-2 ring-blue-100"
                />
                <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1.5">Hoặc chọn avatar mẫu có sẵn:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {AVATAR_PRESETS.map((presetUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(presetUrl)}
                      className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        avatar === presetUrl ? 'border-blue-600 scale-110 shadow-sm' : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={presetUrl} alt="Avatar option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Student Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và Tên Học Sinh *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="vd: Nguyễn Hoàng Nam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Học Sinh *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="vd: hoangnam.ielts@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Account Credentials Section (Auto-created for student) */}
          {!studentToEdit && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  Cấp Tài Khoản Con Cho Học Sinh Này
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded font-semibold">
                  Chỉ vào giao diện học sinh
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    Tên đăng nhập (Username)
                  </label>
                  <input
                    type="text"
                    placeholder="Mặc định lấy từ email (vd: hoangnam)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    Mật khẩu đăng nhập
                  </label>
                  <input
                    type="text"
                    placeholder="Mặc định: 123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Phone & Class Assign */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số Điện Thoại / Zalo
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="vd: 0912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Gán Vào Lớp Học (chọn 1 hoặc nhiều) *</span>
                <span className="text-[11px] text-blue-600 font-bold">
                  Đã chọn {selectedClassIds.length} lớp
                </span>
              </label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {classes.map((cls) => {
                  const isChecked = selectedClassIds.includes(cls.id);
                  return (
                    <label
                      key={cls.id}
                      onClick={() => toggleClassSelection(cls.id)}
                      className={`flex items-center justify-between p-1.5 px-2 rounded-md border text-xs cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-blue-50/90 border-blue-300 text-blue-900 font-bold'
                          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 text-blue-600 rounded-sm focus:ring-0 cursor-pointer shrink-0"
                        />
                        <span className="truncate">{cls.name}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-80 shrink-0 ml-1">
                        {cls.code || cls.level}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Target Band & Calculated Entry Band */}
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-700" />
                <span className="text-xs font-bold text-blue-900">Mục Tiêu & Điểm Đánh Giá Đầu Vào</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500">Band Ước Tính Hiện Tại: </span>
                <span className="text-sm font-black text-blue-700 font-mono">Band {currentEstimated.toFixed(1)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Mục Tiêu (Target Band)
                </label>
                <select
                  value={targetBand}
                  onChange={(e) => setTargetBand(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-blue-200 rounded-lg font-bold text-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value={5.5}>Band 5.5 (Foundation)</option>
                  <option value={6.0}>Band 6.0 (Competent)</option>
                  <option value={6.5}>Band 6.5 (Intensive Target)</option>
                  <option value={7.0}>Band 7.0 (Good User)</option>
                  <option value={7.5}>Band 7.5 (Master Target)</option>
                  <option value={8.0}>Band 8.0 (Very Good User)</option>
                  <option value={8.5}>Band 8.5 (Expert)</option>
                </select>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 text-center mb-0.5">
                    Reading
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={readingScore}
                    onChange={(e) => setReadingScore(Number(e.target.value))}
                    className="w-full text-center py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 text-center mb-0.5">
                    Listening
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={listeningScore}
                    onChange={(e) => setListeningScore(Number(e.target.value))}
                    className="w-full text-center py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 text-center mb-0.5">
                    Writing
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={writingScore}
                    onChange={(e) => setWritingScore(Number(e.target.value))}
                    className="w-full text-center py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 text-center mb-0.5">
                    Speaking
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={speakingScore}
                    onChange={(e) => setSpeakingScore(Number(e.target.value))}
                    className="w-full text-center py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Course Timeline: Joined Date & Expected End Date */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/80 space-y-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-950">Thời Gian Khóa Học & Lộ Trình</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ngày Nhập Học *
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="date"
                    required
                    value={joinedDate}
                    onChange={(e) => setJoinedDate(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ngày Kết Thúc Dự Kiến
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="date"
                    value={expectedEndDate}
                    onChange={(e) => setExpectedEndDate(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pedagogical Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi Chú Sư Phạm Ban Đầu (Điểm mạnh / điểm yếu cần cải thiện)
            </label>
            <textarea
              rows={2}
              placeholder="vd: Học viên có vốn từ tốt ở Speaking nhưng Writing Task 2 cần củng cố mạch lạc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{studentToEdit ? 'Lưu Thay Đổi' : 'Thêm Học Sinh Vào Lớp'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
