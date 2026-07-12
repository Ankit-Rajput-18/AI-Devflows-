import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto, QueryProjectsDto } from './dto';
import { getPagination, getPaginationMeta } from '../../utils/pagination.util';
import { generateUniqueSlug } from '../../utils/slug.util';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    const slug = generateUniqueSlug(dto.name);

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        slug,
        color: dto.color || '#3b82f6',
        icon: dto.icon,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: { select: { members: true, tasks: true } },
      },
    });

    this.logger.log('Project created: ' + project.name);
    return { message: 'Project created successfully', data: project };
  }

  async findAll(query: QueryProjectsDto, userId: string) {
    const { skip, take, page, limit } = getPagination({
      page: query.page,
      limit: query.limit,
    });

    const where: any = {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    };

    if (query.search) {
      where.AND = {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take,
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          _count: {
            select: { members: true, tasks: true, sprints: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, role: true },
            },
          },
        },
        _count: {
          select: { tasks: true, sprints: true, files: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return { data: project };
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      const member = await this.prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: id, userId } },
      });
      if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
        throw new ForbiddenException('You do not have permission to update this project');
      }
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        status: dto.status,
        color: dto.color,
        icon: dto.icon,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: { select: { members: true, tasks: true } },
      },
    });

    this.logger.log('Project updated: ' + updated.name);
    return { message: 'Project updated successfully', data: updated };
  }

  async remove(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can delete the project');
    }

    await this.prisma.project.delete({ where: { id } });

    this.logger.log('Project deleted: ' + project.name);
    return { message: 'Project deleted successfully' };
  }

  async addMember(projectId: string, dto: AddMemberDto, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const existingMember = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: dto.userId } },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this project');
    }

    const member = await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: dto.userId,
        role: (dto.role as any) || 'DEVELOPER',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    this.logger.log('Member added to project: ' + projectId);
    return { message: 'Member added successfully', data: member };
  }

  async removeMember(projectId: string, memberId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can remove members');
    }

    if (memberId === userId) {
      throw new ForbiddenException('Owner cannot remove themselves');
    }

    await this.prisma.projectMember.deleteMany({
      where: { projectId, userId: memberId },
    });

    return { message: 'Member removed successfully' };
  }

  async getMembers(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, role: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return { data: members };
  }
}
