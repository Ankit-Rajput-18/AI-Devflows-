// DevFlow AI - Shared Constants

export const APP_NAME = 'DevFlow AI';
export const APP_VERSION = '1.0.0';
export const API_PREFIX = '/api';
export const API_VERSION = 'v1';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export const TOKEN_PREFIX = 'Bearer';
export const COOKIE_NAME = 'devflow_token';

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
  NEW_NOTIFICATION: 'new_notification',
  MARK_READ: 'mark_read',
  TASK_UPDATED: 'task_updated',
  TASK_MOVED: 'task_moved',
  BOARD_UPDATED: 'board_updated',
  AI_REVIEW_START: 'ai_review_start',
  AI_REVIEW_PROGRESS: 'ai_review_progress',
  AI_REVIEW_COMPLETE: 'ai_review_complete',
} as const;

export const QUEUE_NAMES = {
  AI_REVIEW: 'ai-review',
  NOTIFICATIONS: 'notifications',
  EMAIL: 'email',
  FILE_PROCESSING: 'file-processing',
  ANALYTICS: 'analytics',
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/json',
  'application/zip',
];

export const AI_MODELS = {
  GEMINI_PRO: 'gemini-pro',
  GEMINI_FLASH: 'gemini-1.5-flash',
} as const;

export const DEFAULT_LABELS = [
  { name: 'bug', color: '#ef4444' },
  { name: 'feature', color: '#3b82f6' },
  { name: 'improvement', color: '#8b5cf6' },
  { name: 'documentation', color: '#06b6d4' },
  { name: 'refactor', color: '#f59e0b' },
  { name: 'testing', color: '#10b981' },
  { name: 'urgent', color: '#dc2626' },
] as const;
