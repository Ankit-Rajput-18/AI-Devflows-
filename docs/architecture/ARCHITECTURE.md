# DevFlow AI - Architecture

## System Overview

Frontend (Next.js :3000)
     |
Backend (NestJS :4000)
     |
  +--+--+--+
  |     |   |
PostgreSQL Redis BullMQ
(:5432) (:6379)   |
                Gemini AI

## Flow
1. User opens Frontend
2. Frontend calls REST API or GraphQL
3. Backend processes request
4. Data saved in PostgreSQL via Prisma
5. Cache stored in Redis
6. Heavy jobs sent to BullMQ queue
7. Workers process AI tasks via Gemini
8. Real-time updates via Socket.IO
