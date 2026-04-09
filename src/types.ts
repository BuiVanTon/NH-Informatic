export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin';
  xp: number;
  streak: number;
  lastActive: string; // ISO date
  lastLogin: string; // ISO date
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  curriculumId: string;
}

export interface Curriculum {
  id: string;
  title: string;
  content: string;
  grade: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  questionId: string;
  isCorrect: boolean;
  xpEarned: number;
  timestamp: string;
}
