import { PrismaClient, UserRole, ProjectStatus, TaskStatus, TaskPriority } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@devflow.ai' },
    update: {},
    create: {
      email: 'admin@devflow.ai',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Developer User
  const devPassword = await bcrypt.hash('Dev@12345', 12);
  const developer = await prisma.user.upsert({
    where: { email: 'dev@devflow.ai' },
    update: {},
    create: {
      email: 'dev@devflow.ai',
      name: 'John Developer',
      password: devPassword,
      role: UserRole.DEVELOPER,
      isVerified: true,
    },
  });
  console.log('✅ Developer user created:', developer.email);

  // Create Manager User
  const managerPassword = await bcrypt.hash('Manager@123', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@devflow.ai' },
    update: {},
    create: {
      email: 'manager@devflow.ai',
      name: 'Jane Manager',
      password: managerPassword,
      role: UserRole.MANAGER,
      isVerified: true,
    },
  });
  console.log('✅ Manager user created:', manager.email);

  // Create Sample Project
  const project = await prisma.project.upsert({
    where: { slug: 'devflow-ai-main' },
    update: {},
    create: {
      name: 'DevFlow AI',
      description: 'Main AI powered developer workspace project',
      slug: 'devflow-ai-main',
      status: ProjectStatus.ACTIVE,
      color: '#3b82f6',
      ownerId: admin.id,
    },
  });
  console.log('✅ Sample project created:', project.name);

  // Add Members to Project
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: developer.id } },
    update: {},
    create: {
      projectId: project.id,
      userId: developer.id,
      role: 'DEVELOPER',
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: manager.id } },
    update: {},
    create: {
      projectId: project.id,
      userId: manager.id,
      role: 'MANAGER',
    },
  });
  console.log('✅ Project members added');

  // Create Sample Sprint
  const sprint = await prisma.sprint.create({
    data: {
      name: 'Sprint 1',
      goal: 'Setup project foundation and core features',
      projectId: project.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Sample sprint created:', sprint.name);

  // Create Sample Tasks
  const tasks = [
    {
      title: 'Setup NestJS Backend',
      description: 'Initialize NestJS project with all required modules',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      creatorId: admin.id,
      assigneeId: developer.id,
    },
    {
      title: 'Setup Next.js Frontend',
      description: 'Initialize Next.js project with Tailwind and Shadcn UI',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      creatorId: admin.id,
      assigneeId: developer.id,
    },
    {
      title: 'Implement Authentication',
      description: 'JWT and Google OAuth authentication system',
      status: TaskStatus.TODO,
      priority: TaskPriority.URGENT,
      creatorId: manager.id,
      assigneeId: developer.id,
    },
    {
      title: 'Design Database Schema',
      description: 'Create Prisma schema for all entities',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      creatorId: admin.id,
      assigneeId: admin.id,
    },
    {
      title: 'Integrate Gemini AI',
      description: 'Connect Google Gemini AI for code review feature',
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      creatorId: manager.id,
      assigneeId: developer.id,
    },
  ];

  for (const taskData of tasks) {
    await prisma.task.create({
      data: {
        ...taskData,
        projectId: project.id,
        sprintId: sprint.id,
      },
    });
  }
  console.log('✅ Sample tasks created: ' + tasks.length + ' tasks');

  // Create Chat Room
  await prisma.chatRoom.create({
    data: {
      name: 'General',
      type: 'CHANNEL',
      projectId: project.id,
      description: 'General discussion channel',
    },
  });
  console.log('✅ Chat room created');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('Test Accounts:');
  console.log('  Admin:     admin@devflow.ai     / Admin@123');
  console.log('  Developer: dev@devflow.ai        / Dev@12345');
  console.log('  Manager:   manager@devflow.ai   / Manager@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.\();
  });
