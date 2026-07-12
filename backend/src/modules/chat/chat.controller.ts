import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChatRoomDto, SendMessageDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('rooms')
  @ApiOperation({ summary: 'Create chat room' })
  createRoom(@Body() dto: CreateChatRoomDto) {
    return this.chatService.createRoom(dto);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Get all chat rooms' })
  getRooms(@Query('projectId') projectId?: string) {
    return this.chatService.getRooms(projectId);
  }

  @Get('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Get room messages' })
  getMessages(
    @Param('roomId') roomId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(roomId, page, limit);
  }

  @Post('rooms/:roomId/messages')
  @ApiOperation({ summary: 'Send message' })
  sendMessage(
    @Param('roomId') roomId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.sendMessage(roomId, dto, userId);
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Delete message' })
  deleteMessage(
    @Param('messageId') messageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chatService.deleteMessage(messageId, userId);
  }
}
