import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FilesController {
  constructor(
    private filesService: FilesService,
    private prisma: PrismaService,
  ) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Only image files allowed'), false);
      }
      cb(null, true);
    },
  }))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const url = await this.filesService.uploadImage(file, 'devflow-ai/avatars');

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: url },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    return {
      message: 'Avatar uploaded successfully',
      data: { user, url },
    };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  @ApiOperation({ summary: 'Upload general file' })
  @ApiConsumes('multipart/form-data')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const url = await this.filesService.uploadImage(file, 'devflow-ai/files');

    return {
      message: 'File uploaded successfully',
      data: {
        url,
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      },
    };
  }
}