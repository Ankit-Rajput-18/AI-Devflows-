// DevFlow AI - Shared Types

export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DEVELOPER = 'DEVELOPER',
  VIEWER = 'VIEWER',
}

export interface IProject {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  COMPLETED = 'COMPLETED',
}

export interface ITask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  projectId: string;
  sprintId?: string;
  labels: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface ISprint {
  id: string;
  name: string;
  projectId: string;
  status: SprintStatus;
  startDate: Date;
  endDate: Date;
  goal?: string;
  createdAt: Date;
}

export enum SprintStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface IChatMessage {
  id: string;
  content: string;
  senderId: string;
  roomId: string;
  type: MessageType;
  createdAt: Date;
}

export enum MessageType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  CODE = 'CODE',
  SYSTEM = 'SYSTEM',
}

export interface INotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  userId: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  PR_REVIEW = 'PR_REVIEW',
  MENTION = 'MENTION',
  COMMENT = 'COMMENT',
  SPRINT_UPDATE = 'SPRINT_UPDATE',
  AI_REVIEW_COMPLETE = 'AI_REVIEW_COMPLETE',
  MEETING_INVITE = 'MEETING_INVITE',
  SYSTEM = 'SYSTEM',
}

export interface IAIReview {
  id: string;
  code: string;
  language: string;
  review: string;
  bugs: IBug[];
  suggestions: string[];
  score: number;
  createdAt: Date;
}

export interface IBug {
  line: number;
  severity: BugSeverity;
  message: string;
  suggestion: string;
}

export enum BugSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
