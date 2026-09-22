export type UserRole = 'student' | 'professor' | 'admin' | 'soc_auditor';
export type UserStatus = 'active' | 'suspended' | 'locked';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  failedLoginCount: number;
  department?: string;
  biography?: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  summary: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  instructorId: string;
  instructorName: string;
  instructorEmail: string;
  capacity: number;
  enrolledCount: number;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  modulesCount: number;
  durationHours: number;
  lessons: Lesson[];
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'cancelled';
  progressPercentage: number;
  completedLessonIds: string[];
  lastAccessedAt: string;
  notes?: string;
}

export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EventType =
  | 'ACCOUNT_CREATED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'COURSE_ENROLLED'
  | 'ENROLLMENT_CANCELLED'
  | 'COURSE_CREATED'
  | 'COURSE_MODIFIED'
  | 'COURSE_DELETED'
  | 'PROGRESS_UPDATED'
  | 'ADMIN_ACTION'
  | 'PRIVILEGE_ESCALATION_ATTEMPT'
  | 'BRUTE_FORCE_DETECTED';

export interface MitreAttackInfo {
  techniqueId: string;
  techniqueName: string;
  tactic: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: EventType;
  severity: EventSeverity;
  sourceIp: string;
  userAgent: string;
  endpoint: string;
  httpMethod: string;
  httpStatus: number;
  actor: {
    id?: string;
    email?: string;
    role?: string;
    name?: string;
    sessionId?: string;
  };
  target: {
    type: string;
    id?: string;
    name?: string;
  };
  action: string;
  outcome: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  details: Record<string, any>;
  mitreAttack?: MitreAttackInfo;
  forwardedToWebhook?: boolean;
}

export interface SOCWebhookConfig {
  url: string;
  enabled: boolean;
  format: 'json' | 'cef' | 'syslog';
  minSeverity: EventSeverity;
  customAuthHeader?: string;
  lastTestStatus?: 'SUCCESS' | 'FAILURE' | 'NONE';
  lastTestTimestamp?: string;
}

export interface SOCStats {
  totalEvents: number;
  failedLogins: number;
  criticalAlerts: number;
  adminActions: number;
  courseModifications: number;
  enrollmentsCount: number;
  recentEventsCount: number;
  severityBreakdown: {
    INFO: number;
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  activeUsers: number;
  totalCourses: number;
  webhookConfigured: boolean;
}
