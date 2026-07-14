import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@devflow.ai' },
    update: {},
    create: {
      email: 'admin@devflow.ai',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const devPassword = await bcrypt.hash('Dev@12345', 12);
  const developer = await prisma.user.upsert({
    where: { email: 'dev@devflow.ai' },
    update: {},
    create: {
      email: 'dev@devflow.ai',
      name: 'John Developer',
      password: devPassword,
      role: 'DEVELOPER',
      isVerified: true,
    },
  });

  const managerPassword = await bcrypt.hash('Manager@123', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@devflow.ai' },
    update: {},
    create: {
      email: 'manager@devflow.ai',
      name: 'Jane Manager',
      password: managerPassword,
      role: 'MANAGER',
      isVerified: true,
    },
  });

  const project = await prisma.project.upsert({
    where: { slug: 'devflow-ai-main' },
    update: {},
    create: {
      name: 'DevFlow AI',
      description: 'Main project',
      slug: 'devflow-ai-main',
      status: 'ACTIVE',
      color: '#3b82f6',
      ownerId: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: developer.id } },
    update: {},
    create: { projectId: project.id, userId: developer.id, role: 'DEVELOPER' },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: manager.id } },
    update: {},
    create: { projectId: project.id, userId: manager.id, role: 'MANAGER' },
  });

  const sprint = await prisma.sprint.create({
    data: {
      name: 'Sprint 1',
      goal: 'Setup foundation',
      projectId: project.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const tasks = [
    { title: 'Setup NestJS Backend', status: 'DONE', priority: 'HIGH', creatorId: admin.id, assigneeId: developer.id },
    { title: 'Setup Next.js Frontend', status: 'IN_PROGRESS', priority: 'HIGH', creatorId: admin.id, assigneeId: developer.id },
    { title: 'Implement Authentication', status: 'TODO', priority: 'URGENT', creatorId: manager.id, assigneeId: developer.id },
    { title: 'Design Database Schema', status: 'DONE', priority: 'HIGH', creatorId: admin.id, assigneeId: admin.id },
    { title: 'Integrate Gemini AI', status: 'BACKLOG', priority: 'MEDIUM', creatorId: manager.id, assigneeId: developer.id },
  ];

  for (const taskData of tasks) {
    await prisma.task.create({
      data: { ...taskData, projectId: project.id, sprintId: sprint.id },
    });
  }

  await prisma.chatRoom.create({
    data: { name: 'General', type: 'CHANNEL', projectId: project.id },
  });

  console.log('Seed complete!');
  console.log('admin@devflow.ai / Admin@123');
  console.log('dev@devflow.ai / Dev@12345');
  console.log('manager@devflow.ai / Manager@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });