import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentPortal } from './components/StudentPortal';
import { CreateAssignmentModal } from './components/CreateAssignmentModal';
import { GradingModal } from './components/GradingModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { TestTakingRoom } from './components/TestTakingRoom';
import { StudentFeedbackViewModal } from './components/StudentFeedbackViewModal';
import { LoginScreen } from './components/LoginScreen';
import { StorageService } from './services/storage';
import { Assignment, AuthUser, ClassGroup, Student, Submission, UserAccount } from './types';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { roundIELTSBand } from './utils/formatters';

export function App() {
  // Authentication & Accounts state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => StorageService.getAuthSession());
  const [accounts, setAccounts] = useState<UserAccount[]>(() => StorageService.getAccounts());

  // App domain state from persistent storage
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [currentStudentId, setCurrentStudentId] = useState<string>('st-1');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<{ submission: Submission; assignment?: Assignment } | null>(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [testTakingAssignment, setTestTakingAssignment] = useState<Assignment | null>(null);
  const [viewingFeedback, setViewingFeedback] = useState<{ submission: Submission; assignment?: Assignment } | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Load initial data from storage
  useEffect(() => {
    const loadedClasses = StorageService.getClasses();
    const loadedStudents = StorageService.getStudents();
    const loadedAssignments = StorageService.getAssignments();
    const loadedSubmissions = StorageService.getSubmissions();
    const loadedAccounts = StorageService.getAccounts();

    setClasses(loadedClasses);
    setStudents(loadedStudents);
    setAssignments(loadedAssignments);
    setSubmissions(loadedSubmissions);
    setAccounts(loadedAccounts);

    // If authenticated as a student, sync currentStudentId with account's student profile
    const session = StorageService.getAuthSession();
    if (session) {
      setCurrentUser(session);
      if (session.role === 'student') {
        if (session.studentProfileId) {
          setCurrentStudentId(session.studentProfileId);
        } else {
          const matchedStudent = loadedStudents.find((s) => s.email.toLowerCase() === session.email.toLowerCase() || s.name.toLowerCase() === session.name.toLowerCase());
          if (matchedStudent) {
            setCurrentStudentId(matchedStudent.id);
          }
        }
      }
    }
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    StorageService.saveAuthSession(user);

    if (user.role === 'student') {
      if (user.studentProfileId) {
        setCurrentStudentId(user.studentProfileId);
      } else {
        const matched = students.find(
          (s) => s.email.toLowerCase() === user.email.toLowerCase() || s.name.toLowerCase() === user.name.toLowerCase()
        );
        if (matched) {
          setCurrentStudentId(matched.id);
        }
      }
    }
    showToast(`Chào mừng ${user.name} (${user.role === 'teacher' ? 'Giáo Viên' : 'Học Viên'}) đã đăng nhập!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    StorageService.saveAuthSession(null);
    showToast('Đã đăng xuất tài khoản thành công.');
  };

  // Avatar Update Handler for logged-in user
  const handleUpdateCurrentUserAvatar = (newAvatar: string) => {
    if (!currentUser) return;
    const updatedUser: AuthUser = { ...currentUser, avatar: newAvatar };
    setCurrentUser(updatedUser);
    StorageService.saveAuthSession(updatedUser);

    // If teacher, update teacher account
    if (currentUser.role === 'teacher') {
      const teacherAcc = accounts.find((a) => a.id === currentUser.id || a.role === 'teacher');
      if (teacherAcc) {
        const updatedAcc = { ...teacherAcc, avatar: newAvatar };
        StorageService.updateAccount(updatedAcc);
        setAccounts(StorageService.getAccounts());
      }
    } else {
      // If student, update student profile in students list and account
      const matchedStudent = students.find(
        (s) =>
          s.id === currentUser.studentProfileId ||
          s.id === currentUser.id ||
          s.email.toLowerCase() === currentUser.email.toLowerCase()
      );
      if (matchedStudent) {
        const updatedStudent: Student = { ...matchedStudent, avatar: newAvatar };
        const updatedList = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
        setStudents(updatedList);
        StorageService.saveStudents(updatedList);
      }
      const studentAcc = accounts.find(
        (a) => a.id === currentUser.id || a.email.toLowerCase() === currentUser.email.toLowerCase()
      );
      if (studentAcc) {
        const updatedAcc = { ...studentAcc, avatar: newAvatar };
        StorageService.updateAccount(updatedAcc);
        setAccounts(StorageService.getAccounts());
      }
    }
    showToast('Đã cập nhật ảnh đại diện thành công!');
  };

  const handleUpdateStudentAvatar = (studentId: string, newAvatar: string) => {
    const updatedList = students.map((s) => (s.id === studentId ? { ...s, avatar: newAvatar } : s));
    setStudents(updatedList);
    StorageService.saveStudents(updatedList);

    // Also update account if matching
    const studentAcc = accounts.find((a) => a.studentProfileId === studentId);
    if (studentAcc) {
      StorageService.updateAccount({ ...studentAcc, avatar: newAvatar });
      setAccounts(StorageService.getAccounts());
    }
    if (selectedStudentForProfile && selectedStudentForProfile.id === studentId) {
      setSelectedStudentForProfile({ ...selectedStudentForProfile, avatar: newAvatar });
    }
    showToast('Đã cập nhật ảnh đại diện học sinh thành công!');
  };

  // Account Management Handlers
  const handleSaveAccount = (account: UserAccount) => {
    StorageService.updateAccount(account);
    setAccounts(StorageService.getAccounts());
  };

  const handleDeleteAccount = (id: string) => {
    StorageService.deleteAccount(id);
    setAccounts(StorageService.getAccounts());
  };

  // Save changes to storage
  const handleSaveClass = (classData: ClassGroup, enrolledStudentIds?: string[]) => {
    const exists = classes.some((c) => c.id === classData.id);
    let updated: ClassGroup[];
    if (exists) {
      updated = classes.map((c) => (c.id === classData.id ? classData : c));
    } else {
      updated = [...classes, classData];
    }
    setClasses(updated);
    StorageService.saveClasses(updated);

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
      setStudents(updatedStudents);
      StorageService.saveStudents(updatedStudents);
    }
    showToast(`Đã lưu thông tin lớp "${classData.name}"!`);
  };

  const handleDeleteClass = (classId: string) => {
    const updated = classes.filter((c) => c.id !== classId);
    setClasses(updated);
    StorageService.saveClasses(updated);
    if (selectedClassId === classId) {
      setSelectedClassId('all');
    }
  };

  const handleSaveStudent = (studentData: Student, accountCredentials?: { username: string; password: string }) => {
    const exists = students.some((s) => s.id === studentData.id);
    let updated: Student[];
    if (exists) {
      updated = students.map((s) => (s.id === studentData.id ? studentData : s));
    } else {
      updated = [studentData, ...students];
    }
    setStudents(updated);
    StorageService.saveStudents(updated);

    // If new student created, auto-create student account
    if (!exists) {
      const username = accountCredentials?.username || studentData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || `hs_${Date.now().toString().slice(-4)}`;
      const password = accountCredentials?.password || '123';

      const newAccount = StorageService.createStudentAccount({
        username,
        password,
        name: studentData.name,
        email: studentData.email,
        role: 'student',
        avatar: studentData.avatar,
        studentProfileId: studentData.id,
        classId: studentData.classId,
        className: studentData.className,
      });

      setAccounts(StorageService.getAccounts());
      showToast(`Đã thêm học sinh & cấp tài khoản con: user "${newAccount.username}" (mật khẩu: "${newAccount.password}")`);
    } else {
      showToast(`Đã cập nhật thông tin học sinh "${studentData.name}"!`);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    const updated = students.filter((s) => s.id !== studentId);
    setStudents(updated);
    StorageService.saveStudents(updated);

    // Also remove student's account
    const matchedAccount = accounts.find((a) => a.studentProfileId === studentId);
    if (matchedAccount) {
      handleDeleteAccount(matchedAccount.id);
    }
  };

  const handleSaveAssignment = (newAssignment: Assignment) => {
    const updated = [newAssignment, ...assignments];
    setAssignments(updated);
    StorageService.saveAssignments(updated);
    showToast(`Đã tạo & giao bài tập "${newAssignment.title}" thành công!`);
  };

  const handleDeleteAssignment = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    setAssignments(updated);
    StorageService.saveAssignments(updated);
    showToast('Đã xóa bài tập thành công');
  };

  const handleSaveGrade = (updatedSubmission: Submission) => {
    const updatedSubs = submissions.map((s) => (s.id === updatedSubmission.id ? updatedSubmission : s));
    setSubmissions(updatedSubs);
    StorageService.saveSubmissions(updatedSubs);

    // Also update student's estimated band if overall band exists
    if (updatedSubmission.overallBand) {
      const updatedStudents = students.map((st) => {
        if (st.id === updatedSubmission.studentId) {
          const newSkillScores = { ...st.skillScores };
          newSkillScores[updatedSubmission.assignmentSkill] = updatedSubmission.overallBand!;
          const avg = (newSkillScores.reading + newSkillScores.listening + newSkillScores.writing + newSkillScores.speaking) / 4;
          const roundedAvg = roundIELTSBand(avg);

          return {
            ...st,
            skillScores: newSkillScores,
            currentEstimatedBand: roundedAvg
          };
        }
        return st;
      });
      setStudents(updatedStudents);
      StorageService.saveStudents(updatedStudents);
    }

    showToast(`Đã lưu kết quả chấm bài cho học sinh ${updatedSubmission.studentName}!`);
  };

  const handleStudentSubmitTest = (newSubmission: Submission) => {
    const updatedSubs = [newSubmission, ...submissions];
    setSubmissions(updatedSubs);
    StorageService.saveSubmissions(updatedSubs);

    // Update student submission counts
    const updatedStudents = students.map((st) => {
      if (st.id === newSubmission.studentId) {
        return {
          ...st,
          totalSubmissions: st.totalSubmissions + 1,
          onTimeSubmissions: st.onTimeSubmissions + 1,
        };
      }
      return st;
    });
    setStudents(updatedStudents);
    StorageService.saveStudents(updatedStudents);

    setTestTakingAssignment(null);
    showToast(`🎉 Nộp bài thành công! Giáo viên sẽ sớm gửi điểm và nhận xét.`);
  };

  const handleUpdateStudentNotes = (studentId: string, notes: string) => {
    const updated = students.map((st) => (st.id === studentId ? { ...st, notes } : st));
    setStudents(updated);
    StorageService.saveStudents(updated);
    showToast('Đã cập nhật ghi chú sư phạm');
  };

  // If user is not logged in, render the Login Screen
  if (!currentUser) {
    return <LoginScreen accounts={accounts} onLoginSuccess={handleLoginSuccess} />;
  }

  // Derive current student profile when in student role
  const currentStudent: Student | null =
    students.find(
      (s) =>
        s.id === currentUser.studentProfileId ||
        s.email.toLowerCase() === currentUser.email.toLowerCase() ||
        s.id === currentStudentId
    ) ||
    students[0] ||
    (currentUser.role === 'student'
      ? {
          id: currentUser.studentProfileId || currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          classId: currentUser.classId || '',
          className: currentUser.className || 'Chưa xếp lớp',
          targetBand: 6.5,
          currentEstimatedBand: 6.0,
          skillScores: {
            reading: 6.0,
            listening: 6.0,
            writing: 6.0,
            speaking: 6.0,
          },
          totalSubmissions: 0,
          onTimeSubmissions: 0,
          lateSubmissions: 0,
          joinedDate: new Date().toISOString().split('T')[0],
        }
      : null);

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-60 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        classes={classes}
        selectedClassId={selectedClassId}
        onClassChange={setSelectedClassId}
        students={students}
        currentStudentId={currentStudent?.id || currentStudentId}
        onStudentChange={setCurrentStudentId}
        onOpenCreateAssignment={() => setIsCreateModalOpen(true)}
        onOpenAccountManagement={() => setIsAccountModalOpen(true)}
        onResetDemo={() => StorageService.resetDemoData()}
        onUpdateAvatar={handleUpdateCurrentUserAvatar}
      />

      {/* Main Workspace - Full Width Fluid Screen */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-3 sm:p-5 lg:p-6">
        {currentUser.role === 'teacher' ? (
          <TeacherDashboard
            assignments={assignments}
            students={students}
            submissions={submissions}
            classes={classes}
            accounts={accounts}
            selectedClassId={selectedClassId}
            onClassChange={setSelectedClassId}
            onOpenCreateAssignment={() => setIsCreateModalOpen(true)}
            onOpenGrading={(sub, assign) => setGradingSubmission({ submission: sub, assignment: assign })}
            onOpenStudentProfile={(st) => setSelectedStudentForProfile(st)}
            onDeleteAssignment={handleDeleteAssignment}
            onUpdateClasses={(newCls) => setClasses(newCls)}
            onSaveClass={handleSaveClass}
            onDeleteClass={handleDeleteClass}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onSaveAccount={handleSaveAccount}
            onDeleteAccount={handleDeleteAccount}
            isAccountModalOpen={isAccountModalOpen}
            onCloseAccountModal={() => setIsAccountModalOpen(false)}
          />
        ) : (
          currentStudent && (
            <StudentPortal
              student={currentStudent}
              assignments={assignments}
              submissions={submissions}
              onStartAssignment={(assign) => setTestTakingAssignment(assign)}
              onViewSubmissionDetail={(sub, assign) => setViewingFeedback({ submission: sub, assignment: assign })}
              onUpdateAvatar={handleUpdateCurrentUserAvatar}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white">
        <p className="font-semibold text-slate-700">
          IELTS Homework — Nền Tảng Giao Bài Tập & Theo Dõi Tiến Độ IELTS 4 Kỹ Năng
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Tài khoản: {currentUser.name} ({currentUser.role === 'teacher' ? 'Giáo Viên Toàn Quyền' : 'Học Sinh'}) • Phiên làm việc bảo mật
        </p>
      </footer>

      {/* Modals */}
      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        classes={classes}
        onSave={handleSaveAssignment}
      />

      {gradingSubmission && (
        <GradingModal
          isOpen={true}
          onClose={() => setGradingSubmission(null)}
          submission={gradingSubmission.submission}
          assignment={gradingSubmission.assignment}
          onSaveGrade={handleSaveGrade}
        />
      )}

      {selectedStudentForProfile && (
        <StudentProfileModal
          isOpen={true}
          onClose={() => setSelectedStudentForProfile(null)}
          student={selectedStudentForProfile}
          submissions={submissions}
          assignments={assignments}
          classes={classes}
          onUpdateStudentNotes={handleUpdateStudentNotes}
          onUpdateStudentAvatar={handleUpdateStudentAvatar}
          onSavePersonalizedAssignment={handleSaveAssignment}
          onSaveScheduleSession={(newSession) => {
            StorageService.addScheduleSession(newSession);
            showToast(`Đã hẹn buổi học kèm 1-1 với học sinh ${newSession.studentName} và đồng bộ thời khóa biểu!`);
          }}
          onOpenGrading={(sub, assign) => {
            setSelectedStudentForProfile(null);
            setGradingSubmission({ submission: sub, assignment: assign });
          }}
        />
      )}

      {testTakingAssignment && currentStudent && (
        <TestTakingRoom
          assignment={testTakingAssignment}
          student={currentStudent}
          onClose={() => setTestTakingAssignment(null)}
          onSubmit={handleStudentSubmitTest}
        />
      )}

      {viewingFeedback && (
        <StudentFeedbackViewModal
          isOpen={true}
          onClose={() => setViewingFeedback(null)}
          submission={viewingFeedback.submission}
          assignment={viewingFeedback.assignment}
        />
      )}

    </div>
  );
}
export default App;
