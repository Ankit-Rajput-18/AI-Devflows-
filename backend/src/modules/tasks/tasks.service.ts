import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  CreateTaskCommentDto,
  QueryTasksDto,
} from './dto';
import { getPagination, getPaginationMeta } from '../../utils/pagination.util';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto, userId: string) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        sprintId: dto.sprintId,
        assigneeId: dto.assigneeId,
        creatorId: userId,
        priority: dto.priority || 'MEDIUM',
        type: dto.type || 'TASK',
        labels: dto.labels || [],
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        estimatedHours: dto.estimatedHours,
        parentId: dto.parentId,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        project: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    this.logger.log('Task created: ' + task.title);
    return { message: 'Task created successfully', data: task };
  }

  async findAll(query: QueryTasksDto) {
    const { skip, take, page, limit } = getPagination({
      page: query.page,
      limit: query.limit,
    });

    const where: any = {};

    if (query.projectId) where.projectId = query.projectId;
    if (query.sprintId) where.sprintId = query.sprintId;
    if (query.assigneeId) where.assigneeId = query.assigneeId;
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        include: {
          assignee: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          creator: {
            select: { id: true, name: true, avatar: true },
          },
          project: {
            select: { id: true, name: true },
          },
          _count: {
            select: { comments: true, subTasks: true, attachments: true },
          },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        project: {
          select: { id: true, name: true, slug: true },
        },
        sprint: {
          select: { id: true, name: true, status: true },
        },
        subTasks: {
          select: { id: true, title: true, status: true, priority: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
        _count: {
          select: { comments: true, subTasks: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return { data: task };
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        type: dto.type,
        assigneeId: dto.assigneeId,
        sprintId: dto.sprintId,
        labels: dto.labels,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        estimatedHours: dto.estimatedHours,
        actualHours: dto.actualHours,
        order: dto.order,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    this.logger.log('Task updated: ' + updated.title);
    return { message: 'Task updated successfully', data: updated };
  }

  async updateStatus(id: string, dto: UpdateTaskStatusDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: dto.status },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    this.logger.log('Task status updated: ' + updated.title + ' -> ' + updated.status);
    return { message: 'Task status updated', data: updated };
  }

  async remove(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    await this.prisma.task.delete({ where: { id } });

    this.logger.log('Task deleted: ' + task.title);
    return { message: 'Task deleted successfully' };
  }

  async addComment(taskId: string, dto: CreateTaskCommentDto, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const comment = await this.prisma.taskComment.create({
      data: {
        content: dto.content,
        taskId,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return { message: 'Comment added', data: comment };
  }

  async getComments(taskId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const comments = await this.prisma.taskComment.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: comments };
  }

  async getBoardTasks(projectId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { comments: true, subTasks: true },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    const board = {
      BACKLOG: tasks.filter((t) => t.status === 'BACKLOG'),
      TODO: tasks.filter((t) => t.status === 'TODO'),
      IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
      IN_REVIEW: tasks.filter((t) => t.status === 'IN_REVIEW'),
      DONE: tasks.filter((t) => t.status === 'DONE'),
    };

    return { data: board };
  }
}
