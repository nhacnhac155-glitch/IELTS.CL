import { Assignment, AttendanceRecord, ClassGroup, ClassScheduleSession, InClassResult, Student, Submission, UserAccount, AuthUser, TestRecord } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_ASSIGNMENTS, INITIAL_CLASSES, INITIAL_SCHEDULES, INITIAL_STUDENTS, INITIAL_SUBMISSIONS } from '../mockData';
import { roundIELTSBand } from '../utils/formatters';

const STORAGE_KEYS = {
  ACCOUNTS: 'ielts_app_accounts_v2',
  AUTH_SESSION: 'ielts_app_auth_session_v2',
  ASSIGNMENTS: 'ielts_app_assignments_v2',
  STUDENTS: 'ielts_app_students_v2',
  SUBMISSIONS: 'ielts_app_submissions_v2',
  CLASSES: 'ielts_app_classes_v2',
  ATTENDANCE: 'ielts_app_attendance_v2',
  SCHEDULES: 'ielts_app_schedules_v2',
  IN_CLASS_RESULTS: 'ielts_app_in_class_results_v2',
  TEST_RECORDS: 'ielts_app_test_records_v2',
};

const LEGACY_KEYS = [
  'ielts_app_accounts_v1',
  'ielts_app_auth_session_v1',
  'ielts_app_assignments_v1',
  'ielts_app_students_v1',
  'ielts_app_submissions_v1',
  'ielts_app_classes_v1',
  'ielts_app_attendance_v1',
  'ielts_app_schedules_v1',
  'ielts_app_in_class_results_v1',
  'ielts_app_test_records_v1',
];

// Clean legacy demo keys automatically on load
try {
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
} catch {}

const INITIAL_TEST_RECORDS: TestRecord[] = [];
const INITIAL_IN_CLASS_RESULTS: InClassResult[] = [];
const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

// Safe LocalStorage helpers
export const StorageService = {
  getAccounts(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
        return INITIAL_ACCOUNTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ACCOUNTS;
    }
  },

  saveAccounts(accounts: UserAccount[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts to localStorage', e);
    }
  },

  getAuthSession(): AuthUser | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  saveAuthSession(user: AuthUser | null) {
    try {
      if (!user) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      } else {
        localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(user));
      }
    } catch (e) {
      console.error('Failed to save auth session', e);
    }
  },

  createStudentAccount(account: Omit<UserAccount, 'id' | 'createdAt' | 'isActive'>): UserAccount {
    const accounts = this.getAccounts();
    const newAcc: UserAccount = {
      ...account,
      id: `acc-std-${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    accounts.push(newAcc);
    this.saveAccounts(accounts);
    return newAcc;
  },

  updateAccount(updated: UserAccount) {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex((a) => a.id === updated.id);
    if (idx >= 0) {
      accounts[idx] = updated;
      this.saveAccounts(accounts);
    }
  },

  deleteAccount(id: string) {
    const accounts = this.getAccounts().filter((a) => a.id !== id);
    this.saveAccounts(accounts);
  },

  getAssignments(): Assignment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
        return INITIAL_ASSIGNMENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  },

  saveAssignments(assignments: Assignment[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    } catch (e) {
      console.error('Failed to save assignments to localStorage', e);
    }
  },

  addAssignment(assignment: Assignment) {
    const list = this.getAssignments();
    list.unshift(assignment);
    this.saveAssignments(list);
  },

  updateAssignment(assignment: Assignment) {
    const list = this.getAssignments();
    const idx = list.findIndex((a) => a.id === assignment.id);
    if (idx >= 0) {
      list[idx] = assignment;
      this.saveAssignments(list);
    }
  },

  deleteAssignment(id: string) {
    const list = this.getAssignments().filter((a) => a.id !== id);
    this.saveAssignments(list);
  },

  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
        return INITIAL_STUDENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  saveStudents(students: Student[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to localStorage', e);
    }
  },

  getSubmissions(): Submission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
        return INITIAL_SUBMISSIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  },

  saveSubmissions(submissions: Submission[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    } catch (e) {
      console.error('Failed to save submissions to localStorage', e);
    }
  },

  getClasses(): ClassGroup[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
        return INITIAL_CLASSES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CLASSES;
    }
  },

  saveClasses(classes: ClassGroup[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    } catch (e) {
      console.error('Failed to save classes to localStorage', e);
    }
  },

  getAttendance(): AttendanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
        return INITIAL_ATTENDANCE;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ATTENDANCE;
    }
  },

  saveAttendance(attendance: AttendanceRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    } catch (e) {
      console.error('Failed to save attendance to localStorage', e);
    }
  },

  getSchedules(): ClassScheduleSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
        return INITIAL_SCHEDULES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SCHEDULES;
    }
  },

  saveSchedules(schedules: ClassScheduleSession[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    } catch (e) {
      console.error('Failed to save schedules to localStorage', e);
    }
  },

  addScheduleSession(session: ClassScheduleSession) {
    const schedules = this.getSchedules();
    schedules.push(session);
    this.saveSchedules(schedules);
  },

  updateScheduleSession(session: ClassScheduleSession) {
    const schedules = this.getSchedules();
    const idx = schedules.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      schedules[idx] = session;
      this.saveSchedules(schedules);
    }
  },

  deleteScheduleSession(sessionId: string) {
    const schedules = this.getSchedules().filter((s) => s.id !== sessionId);
    this.saveSchedules(schedules);
  },

  getInClassResults(): InClassResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IN_CLASS_RESULTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.IN_CLASS_RESULTS, JSON.stringify(INITIAL_IN_CLASS_RESULTS));
        return INITIAL_IN_CLASS_RESULTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_IN_CLASS_RESULTS;
    }
  },

  saveInClassResults(results: InClassResult[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.IN_CLASS_RESULTS, JSON.stringify(results));
    } catch (e) {
      console.error('Failed to save in-class results to localStorage', e);
    }
  },

  addInClassResult(result: InClassResult) {
    const list = this.getInClassResults();
    list.unshift(result);
    this.saveInClassResults(list);
  },

  updateInClassResult(result: InClassResult) {
    const list = this.getInClassResults();
    const idx = list.findIndex((r) => r.id === result.id);
    if (idx >= 0) {
      list[idx] = result;
      this.saveInClassResults(list);
    }
  },

  deleteInClassResult(id: string) {
    const list = this.getInClassResults().filter((r) => r.id !== id);
    this.saveInClassResults(list);
  },

  getTestRecords(): TestRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEST_RECORDS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TEST_RECORDS, JSON.stringify(INITIAL_TEST_RECORDS));
        return INITIAL_TEST_RECORDS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TEST_RECORDS;
    }
  },

  saveTestRecords(records: TestRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TEST_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save test records to localStorage', e);
    }
  },

  addTestRecord(record: TestRecord) {
    const list = this.getTestRecords();
    list.unshift(record);
    this.saveTestRecords(list);
  },

  updateTestRecord(record: TestRecord) {
    const list = this.getTestRecords();
    const idx = list.findIndex((r) => r.id === record.id);
    if (idx >= 0) {
      list[idx] = record;
      this.saveTestRecords(list);
    }
  },

  deleteTestRecord(id: string) {
    const list = this.getTestRecords().filter((r) => r.id !== id);
    this.saveTestRecords(list);
  },

  resetDemoData() {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }
};
