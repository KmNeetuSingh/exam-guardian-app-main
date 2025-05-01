
export type UserRole = 'student' | 'proctor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface ExamSession {
  id: string;
  title: string;
  studentId: string;
  proctorId?: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'active' | 'completed' | 'flagged';
  idVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
