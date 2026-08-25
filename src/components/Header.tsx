import React, { useRef } from 'react';
import { 
  GraduationCap, 
  UserCheck, 
  PlusCircle, 
  RotateCcw, 
  Sparkles, 
  Users,
  KeyRound, 
  LogOut, 
  ShieldCheck, 
  ChevronDown,
  Camera,
  Upload
} from 'lucide-react';
import { AuthUser, ClassGroup, Student, UserRole } from '../types';

interface HeaderProps {
  currentUser: AuthUser | null;
  onLogout: () => void;
  classes: ClassGroup[];
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  students: Student[];
  currentStudentId: string;
  onStudentChange: (studentId: string) => void;
  onOpenCreateAssignment: () => void;
  onOpenAccountManagement?: () => void;
  onResetDemo?: () => void;
  onUpdateAvatar?: (newAvatar: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  classes,
  selectedClassId,
  onClassChange,
  students,
  currentStudentId,
  onStudentChange,
  onOpenCreateAssignment,
  onOpenAccountManagement,
  onResetDemo,
  onUpdateAvatar,
}) => {
  const isTeacher = currentUser?.role === 'teacher';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs w-full">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-200 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-base sm:text-lg text-slate-900">
                  IELTS <span className="text-blue-600">Homework</span>
                </span>
                {isTeacher ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 rounded">
                    <ShieldCheck className="w-3 h-3 text-purple-600" />
                    Teacher Admin
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    <GraduationCap className="w-3 h-3 text-blue-600" />
                    Học Viên
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 hidden md:block">
                Hệ thống giao bài tập & theo dõi tiến độ IELTS 4 kỹ năng
              </p>
            </div>
          </div>

          {/* Center Class Filter (Visible in Teacher Mode) */}
          {isTeacher && (
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">Lớp học:</span>
              <select
                aria-label="Chọn lớp học"
                value={selectedClassId}
                onChange={(e) => onClassChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Tất cả lớp học ({classes.length})</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.studentCount} HS)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Right Actions: User info, Account Management (for Teacher), Create Assignment, Logout */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Account Manager Button (Only for Teacher) */}
            {isTeacher && onOpenAccountManagement && (
              <button
                type="button"
                onClick={onOpenAccountManagement}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Quản lý và cấp tài khoản con cho học sinh"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Cấp Tài Khoản HS</span>
              </button>
            )}

            {/* Create Assignment Button (for teacher) */}
            {isTeacher && (
              <button
                id="header-create-assignment-btn"
                type="button"
                onClick={onOpenCreateAssignment}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Giao Bài Mới</span>
              </button>
            )}

            {/* Hidden Avatar Upload Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />

            {/* User Profile Card with Avatar Upload & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div 
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                title="Bấm để tải ảnh đại diện mới từ máy tính"
              >
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser?.name || 'User'}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-300 ring-2 ring-transparent group-hover:ring-blue-500 transition-all"
                />
                <div className="absolute inset-0 bg-slate-900/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 line-clamp-1">
                  {currentUser?.name}
                </p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <span>{isTeacher ? 'Giáo Viên (Admin)' : currentUser?.className || 'Học Viên'}</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[9px] text-blue-600 hover:underline cursor-pointer"
                  >
                    (Đổi ảnh)
                  </button>
                </p>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={onLogout}
                title="Đăng xuất"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Reset Data Button */}
            {onResetDemo && (
              <button
                type="button"
                onClick={onResetDemo}
                title="Khôi phục dữ liệu mẫu ban đầu"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
