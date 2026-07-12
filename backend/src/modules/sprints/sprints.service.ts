import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSprintDto, UpdateSprintDto, QuerySprintsDto } from './dto';

@Injectable()
export class SprintsService {
  private readonly logger = new Logger(SprintsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSprintDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    const sprint = await this.prisma.sprint.create({
      data: {
        name: dto.name,
        goal: dto.goal,
        projectId: dto.projectId,
        startDate,
        endDate,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        _count: { select: { tasks: true } },
      },
    });

    this.logger.log('Sprint created: ' + sprint.name);
    return { message: 'Sprint created successfully', data: sprint };
  }

  async findAll(query: QuerySprintsDto) {
    const where: any = {};

    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status;

    const sprints = await this.prisma.sprint.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true },
        },
        _count: { select: { tasks: true } },
        tasks: {
          select: { status: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    const sprintsWithStats = sprints.map((sprint) => {
      const totalTasks = sprint.tasks.length;
      const doneTasks = sprint.tasks.filter((t) => t.status === 'DONE').length;
      const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      const { tasks, ...rest } = sprint;
      return { ...rest, stats: { totalTasks, doneTasks, progress } };
    });

    return { data: sprintsWithStats };
  }

  async findOne(id: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true },
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, avatar: true },
            },
            _count: { select: { comments: true } },
          },
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    const totalTasks = sprint.tasks.length;
    const doneTasks = sprint.tasks.filter((t) => t.status === 'DONE').length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return {
      data: {
        ...sprint,
        stats: { totalTasks, doneTasks, progress },
      },
    };
  }

  async update(id: string, dto: UpdateSprintDto) {
    const sprint = await this.prisma.sprint.findUnique({ where: { id } });
    if (!sprint) throw new NotFoundException('Sprint not found');

    const updated = await this.prisma.sprint.update({
      where: { id },
      data: {
        name: dto.name,
        goal: dto.goal,
        status: dto.status,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        _count: { select: { tasks: true } },
      },
    });

    this.logger.log('Sprint updated: ' + updated.name);
    return { message: 'Sprint updated successfully', data: updated };
  }

  async remove(id: string) {
    const sprint = await this.prisma.sprint.findUnique({ where: { id } });
    if (!sprint) throw new NotFoundException('Sprint not found');

    await this.prisma.task.updateMany({
      where: { sprintId: id },
      data: { sprintId: null },
    });

    await this.prisma.sprint.delete({ where: { id } });

    this.logger.log('Sprint deleted: ' + sprint.name);
    return { message: 'Sprint deleted successfully' };
  }

  async startSprint(id: string) {
    const sprint = await this.prisma.sprint.findUnique({ where: { id } });
    if (!sprint) throw new NotFoundException('Sprint not found');

    if (sprint.status !== 'PLANNING') {
      throw new BadRequestException('Only planned sprints can be started');
    }

    const updated = await this.prisma.sprint.update({
      where: { id },
      data: { status: 'ACTIVE', startDate: new Date() },
    });

    this.logger.log('Sprint started: ' + updated.name);
    return { message: 'Sprint started', data: updated };
  }

  async completeSprint(id: string) {
    const sprint = await this.prisma.sprint.findUnique({ where: { id } });
    if (!sprint) throw new NotFoundException('Sprint not found');

    if (sprint.status !== 'ACTIVE') {
      throw new BadRequestException('Only active sprints can be completed');
    }

    const updated = await this.prisma.sprint.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    this.logger.log('Sprint completed: ' + updated.name);
    return { message: 'Sprint completed', data: updated };
  }
}
