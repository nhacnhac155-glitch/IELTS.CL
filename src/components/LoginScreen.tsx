import React, { useState } from 'react';
import { 
  GraduationCap, 
  Lock, 
  User, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Info
} from 'lucide-react';
import { AuthUser, UserAccount } from '../types';

interface LoginScreenProps {
  accounts: UserAccount[];
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ accounts, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');

  const teacherAccount = accounts.find((a) => a.role === 'teacher') || {
    id: 'acc-teacher-01',
    username: 'teacher',
    password: '123',
    name: 'Cô Celina Phạm (IELTS 8.5)',
    email: 'celinapham.1559@gmail.com',
    role: 'teacher' as const,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2026-01-01',
  };

  const studentAccounts = accounts.filter((a) => a.role === 'student' && a.isActive);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMsg('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    const foundAccount = accounts.find(
      (acc) =>
        (acc.username.toLowerCase() === cleanUsername || acc.email.toLowerCase() === cleanUsername) &&
        acc.password === cleanPassword
    );

    if (!foundAccount) {
      setErrorMsg('Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!');
      return;
    }

    if (!foundAccount.isActive) {
      setErrorMsg('Tài khoản này hiện đang bị tạm khóa. Vui lòng liên hệ giáo viên!');
      return;
    }

    const authUser: AuthUser = {
      id: foundAccount.id,
      username: foundAccount.username,
      name: foundAccount.name,
      email: foundAccount.email,
      role: foundAccount.role,
      avatar: foundAccount.avatar,
      studentProfileId: foundAccount.studentProfileId,
      classId: foundAccount.classId,
      className: foundAccount.className,
      createdAt: foundAccount.createdAt,
    };

    onLoginSuccess(authUser);
  };

  const handleQuickLogin = (account: UserAccount) => {
    setUsername(account.username);
    setPassword(account.password);
    setErrorMsg(null);

    const authUser: AuthUser = {
      id: account.id,
      username: account.username,
      name: account.name,
      email: account.email,
      role: account.role,
      avatar: account.avatar,
      studentProfileId: account.studentProfileId,
      classId: account.classId,
      className: account.className,
      createdAt: account.createdAt,
    };

    onLoginSuccess(authUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-xl shadow-blue-500/25 mb-3 border border-blue-400/30">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            IELTS <span className="text-blue-400">Homework</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hệ thống phân quyền & giao nhận bài tập IELTS 4 kỹ năng
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl py-7 px-6 sm:px-8 shadow-2xl rounded-2xl border border-white/20">
          
          {/* Role Tab Selector for Quick Assist */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-5 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('teacher');
                setUsername('teacher');
                setPassword('123');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'teacher'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Giáo Viên (Toàn quyền)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                if (studentAccounts.length > 0) {
                  setUsername(studentAccounts[0].username);
                  setPassword(studentAccounts[0].password);
                }
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Học Sinh (Học tập)</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="vd: teacher hoặc hoanglong"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Mật khẩu
                </label>
                <span className="text-[11px] text-slate-400">Mặc định: <strong className="text-blue-600">123</strong></span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Đăng Nhập Vào Hệ Thống</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Login Assist Section */}
          <div className="mt-6 pt-5 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                Chọn nhanh tài khoản thử nghiệm
              </span>
            </div>

            {activeTab === 'teacher' ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin(teacherAccount)}
                  className="w-full p-2.5 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={teacherAccount.avatar}
                      alt={teacherAccount.name}
                      className="w-8 h-8 rounded-full object-cover border border-blue-300"
                    />
                    <div>
                      <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                        <span>{teacherAccount.name}</span>
                        <span className="px-1.5 py-0.2 text-[9px] bg-blue-600 text-white rounded font-bold">Admin</span>
                      </div>
                      <p className="text-[10px] text-blue-700">user: <strong>teacher</strong> | pass: <strong>123</strong></p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    Vào ngay &rarr;
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {studentAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className="w-full p-2 bg-slate-50 hover:bg-blue-50/80 border border-slate-200 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-300"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{acc.name}</p>
                        <p className="text-[10px] text-slate-500">
                          user: <strong className="text-slate-700">{acc.username}</strong> | pass: <strong>{acc.password}</strong>
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Đăng nhập &rarr;
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Role Notice */}
            <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Phân quyền nghiêm ngặt:</strong> Tài khoản học sinh chỉ truy cập được giao diện làm bài, xem nhận xét và điểm số của bản thân. Giáo viên có toàn quyền tạo tài khoản, giao bài, chấm điểm và quản lý lớp học.
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
