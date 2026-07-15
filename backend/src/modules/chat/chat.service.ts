import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateChatRoomDto, SendMessageDto } from './dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  async createRoom(dto: CreateChatRoomDto) {
    const room = await this.prisma.chatRoom.create({
      data: {
        name: dto.name,
        description: dto.description,
        projectId: dto.projectId,
        isPrivate: dto.isPrivate || false,
      },
    });

    this.logger.log('Chat room created: ' + room.name);
    return { message: 'Chat room created', data: room };
  }

  async getRooms(projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;

    const rooms = await this.prisma.chatRoom.findMany({
      where,
      include: {
        _count: { select: { messages: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return { data: rooms };
  }

  async getMessages(roomId: string, page?: number, limit?: number) {
    const room = await this.prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Chat room not found');

    const take = limit || 50;
    const skip = page ? (page - 1) * take : 0;

    const [messages, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { roomId },
        include: {
          sender: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take,
      }),
      this.prisma.chatMessage.count({ where: { roomId } }),
    ]);

    return {
      data: messages,
      pagination: { total, page: page || 1, limit: take, totalPages: Math.ceil(total / take) },
    };
  }

  async sendMessage(roomId: string, dto: SendMessageDto, userId: string) {
    const room = await this.prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Chat room not found');

    const message = await this.prisma.chatMessage.create({
      data: {
        content: dto.content,
        type: dto.type || 'TEXT',
        roomId,
        senderId: userId,
        fileUrl: dto.fileUrl,
        fileName: dto.fileName,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    });

    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    this.logger.log('Message sent in room: ' + roomId);
    return { data: message };
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.chatMessage.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');

    await this.prisma.chatMessage.delete({ where: { id: messageId } });
    return { message: 'Message deleted' };
  }
}