# DevFlow AI - API Documentation

## Base URL
- Development: http://localhost:4000/api

## Authentication
Authorization: Bearer <token>

## Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- GET  /api/auth/google
- POST /api/auth/logout

### Projects
- GET    /api/projects
- POST   /api/projects
- GET    /api/projects/:id
- PUT    /api/projects/:id
- DELETE /api/projects/:id

### Tasks
- GET    /api/tasks
- POST   /api/tasks
- GET    /api/tasks/:id
- PUT    /api/tasks/:id
- DELETE /api/tasks/:id
- PATCH  /api/tasks/:id/status

### AI
- POST /api/ai/review
- POST /api/ai/bugs
- POST /api/ai/pr-summary
- POST /api/ai/docs
