export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'VIEWER';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  slug: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  color: string;
  icon?: string;
  ownerId: string;
  owner: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  _count: { members: number; tasks: number; sprints: number };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type: 'TASK' | 'BUG' | 'FEATURE' | 'EPIC' | 'STORY';
  projectId: string;
  sprintId?: string;
  assigneeId?: string;
  assignee?: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  creator: Pick<User, 'id' | 'name' | 'avatar'>;
  labels: string[];
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  _count: { comments: number; subTasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  projectId: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  stats?: { totalTasks: number; doneTasks: number; progress: number };
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'CHANNEL' | 'DIRECT' | 'GROUP';
  projectId?: string;
  description?: string;
  isPrivate: boolean;
  _count: { messages: number };
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  type: 'TEXT' | 'FILE' | 'IMAGE' | 'CODE' | 'SYSTEM';
  roomId: string;
  senderId: string;
  sender: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AIReview {
  id: string;
  score: number;
  summary: string;
  issues: AIBug[];
  goodPractices: string[];
  suggestions: string[];
  createdAt: string;
}

export interface AIBug {
  line: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  suggestion: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface BoardData {
  BACKLOG: Task[];
  TODO: Task[];
  IN_PROGRESS: Task[];
  IN_REVIEW: Task[];
  DONE: Task[];
}
