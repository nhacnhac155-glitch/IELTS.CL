import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  ShieldCheck, 
  GraduationCap, 
  Lock, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Sparkles,
  Search,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { ClassGroup, Student, UserAccount } from '../types';

interface AccountManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: UserAccount[];
  students: Student[];
  classes: ClassGroup[];
  onSaveAccount: (account: UserAccount) => void;
  onDeleteAccount: (id: string) => void;
  onOpenAddStudentModal: () => void;
}

export const AccountManagementModal: React.FC<AccountManagementModalProps> = ({
  isOpen,
  onClose,
  accounts,
  students,
  classes,
  onSaveAccount,
  onDeleteAccount,
  onOpenAddStudentModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleCopyCredentials = (account: UserAccount) => {
    const text = `Tài khoản học tập IELTS Homework:\n- Tên học sinh: ${account.name}\n- Tên đăng nhập: ${account.username}\n- Mật khẩu: ${account.password}\n- Link đăng nhập: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(account.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveEdit = () => {
    if (!editingAccount) return;
    if (!editUsername.trim() || !editPassword.trim()) return;

    onSaveAccount({
      ...editingAccount,
      username: editUsername.trim().toLowerCase(),
      password: editPassword.trim(),
    });
    setEditingAccount(null);
  };

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.className && acc.className.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Quản Lý & Cấp Tài Khoản Đăng Nhập</span>
                <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-semibold">
                  {accounts.length} tài khoản
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tạo và cấp tài khoản con cho học viên, đổi mật khẩu và sao chép thông tin đăng nhập gửi học sinh
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Modal Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên, username, lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddStudentModal();
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm Học Sinh & Cấp Acc Mới</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Table */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Tài Khoản & Người Dùng</th>
                  <th className="py-3 px-3">Vai Trò / Phân Quyền</th>
                  <th className="py-3 px-3">Tên Đăng Nhập</th>
                  <th className="py-3 px-3">Mật Khẩu</th>
                  <th className="py-3 px-3">Lớp Học</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((acc) => {
                  const isTeacher = acc.role === 'teacher';
                  const isCopied = copiedId === acc.id;
                  const isShowingPass = showPasswords[acc.id];

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{acc.name}</p>
                            <p className="text-[11px] text-slate-400">{acc.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-3">
                        {isTeacher ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md font-bold text-[10px]">
                            <ShieldCheck className="w-3 h-3 text-purple-600" />
                            Giáo Viên (Admin)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-semibold text-[10px]">
                            <GraduationCap className="w-3 h-3 text-blue-600" />
                            Học Sinh (Client)
                          </span>
                        )}
                      </td>

                      {/* Username */}
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {acc.username}
                        </span>
                      </td>

                      {/* Password */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {isShowingPass ? acc.password : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleShowPassword(acc.id)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded"
                            title={isShowingPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          >
                            {isShowingPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        {acc.className || (isTeacher ? 'Tất cả lớp' : 'Chưa phân lớp')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(acc)}
                            className={`p-1.5 rounded-lg border transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                              isCopied
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title="Sao chép tài khoản gửi cho học sinh"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="text-[10px] hidden md:inline">{isCopied ? 'Đã chép' : 'Sao chép'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingAccount(acc);
                              setEditUsername(acc.username);
                              setEditPassword(acc.password);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Đổi mật khẩu / Tên đăng nhập"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {!isTeacher && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn xóa tài khoản đăng nhập của "${acc.name}"?`)) {
                                  onDeleteAccount(acc.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Edit Account Inline Submodal/Card */}
          {editingAccount && (
            <div className="mt-4 p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span>Đổi Tên Đăng Nhập & Mật Khẩu: <strong>{editingAccount.name}</strong></span>
                </h4>
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Đóng
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tên đăng nhập mới (username)
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mật khẩu mới (password)
                  </label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
                >
                  Lưu Thông Tin Tài Khoản
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            💡 Mỗi khi bạn tạo một học sinh mới, hệ thống sẽ <strong>tự động tạo tài khoản con</strong> kèm mật khẩu mặc định <strong>123</strong>.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
