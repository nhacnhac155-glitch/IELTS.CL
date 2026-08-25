import { Assignment, ClassGroup, ClassScheduleSession, Student, Submission, UserAccount } from './types';

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc-teacher-01',
    username: 'teacher',
    password: '123',
    name: 'Cô Celina Phạm',
    email: 'celinapham.1559@gmail.com',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: new Date().toISOString().split('T')[0],
  }
];

export const INITIAL_CLASSES: ClassGroup[] = [];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_ASSIGNMENTS: Assignment[] = [];

export const INITIAL_SUBMISSIONS: Submission[] = [];

export const INITIAL_SCHEDULES: ClassScheduleSession[] = [];
