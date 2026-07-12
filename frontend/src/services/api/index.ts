import api from '../../config/api';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  getProfile: () =>
    api.get('/auth/profile'),

  logout: () =>
    api.post('/auth/logout'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const projectsApi = {
  getAll: (params?: any) =>
    api.get('/projects', { params }),

  getById: (id: string) =>
    api.get('/projects/' + id),

  create: (data: { name: string; description?: string; color?: string }) =>
    api.post('/projects', data),

  update: (id: string, data: any) =>
    api.put('/projects/' + id, data),

  delete: (id: string) =>
    api.delete('/projects/' + id),

  getMembers: (id: string) =>
    api.get('/projects/' + id + '/members'),

  addMember: (id: string, data: { userId: string; role?: string }) =>
    api.post('/projects/' + id + '/members', data),

  removeMember: (id: string, memberId: string) =>
    api.delete('/projects/' + id + '/members/' + memberId),
};

export const tasksApi = {
  getAll: (params?: any) =>
    api.get('/tasks', { params }),

  getById: (id: string) =>
    api.get('/tasks/' + id),

  create: (data: any) =>
    api.post('/tasks', data),

  update: (id: string, data: any) =>
    api.put('/tasks/' + id, data),

  updateStatus: (id: string, status: string) =>
    api.patch('/tasks/' + id + '/status', { status }),

  delete: (id: string) =>
    api.delete('/tasks/' + id),

  getBoard: (projectId: string) =>
    api.get('/tasks/board/' + projectId),

  addComment: (id: string, content: string) =>
    api.post('/tasks/' + id + '/comments', { content }),

  getComments: (id: string) =>
    api.get('/tasks/' + id + '/comments'),
};

export const sprintsApi = {
  getAll: (params?: any) =>
    api.get('/sprints', { params }),

  getById: (id: string) =>
    api.get('/sprints/' + id),

  create: (data: any) =>
    api.post('/sprints', data),

  update: (id: string, data: any) =>
    api.put('/sprints/' + id, data),

  start: (id: string) =>
    api.patch('/sprints/' + id + '/start'),

  complete: (id: string) =>
    api.patch('/sprints/' + id + '/complete'),

  delete: (id: string) =>
    api.delete('/sprints/' + id),
};

export const aiApi = {
  codeReview: (data: { code: string; language: string }) =>
    api.post('/ai/review', data),

  bugDetection: (data: { code: string; language: string }) =>
    api.post('/ai/bugs', data),

  prSummary: (data: { code: string }) =>
    api.post('/ai/pr-summary', data),

  generateDocs: (data: { code: string; language: string }) =>
    api.post('/ai/docs', data),

  getReviews: () =>
    api.get('/ai/reviews'),

  getReviewById: (id: string) =>
    api.get('/ai/reviews/' + id),
};

export const chatApi = {
  getRooms: (projectId?: string) =>
    api.get('/chat/rooms', { params: { projectId } }),

  createRoom: (data: { name: string; projectId?: string }) =>
    api.post('/chat/rooms', data),

  getMessages: (roomId: string, page?: number) =>
    api.get('/chat/rooms/' + roomId + '/messages', { params: { page } }),

  sendMessage: (roomId: string, data: { content: string; type?: string }) =>
    api.post('/chat/rooms/' + roomId + '/messages', data),
};

export const notificationsApi = {
  getAll: () =>
    api.get('/notifications'),

  markAsRead: (id: string) =>
    api.patch('/notifications/' + id + '/read'),

  markAllAsRead: () =>
    api.patch('/notifications/read-all'),

  delete: (id: string) =>
    api.delete('/notifications/' + id),
};

export const usersApi = {
  getAll: (params?: any) =>
    api.get('/users', { params }),

  getById: (id: string) =>
    api.get('/users/' + id),

  getMe: () =>
    api.get('/users/me'),

  updateMe: (data: { name?: string; avatar?: string }) =>
    api.put('/users/me', data),
};
