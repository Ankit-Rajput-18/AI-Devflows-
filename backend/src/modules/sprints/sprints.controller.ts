import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SprintsService } from './sprints.service';
import { CreateSprintDto, UpdateSprintDto, QuerySprintsDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Sprints')
@Controller('sprints')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SprintsController {
  constructor(private sprintsService: SprintsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new sprint' })
  create(@Body() dto: CreateSprintDto) {
    return this.sprintsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sprints' })
  findAll(@Query() query: QuerySprintsDto) {
    return this.sprintsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sprint by ID with tasks' })
  findOne(@Param('id') id: string) {
    return this.sprintsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update sprint' })
  update(@Param('id') id: string, @Body() dto: UpdateSprintDto) {
    return this.sprintsService.update(id, dto);
  }

  @Patch(':id/start')
  @ApiOperation({ summary: 'Start sprint' })
  startSprint(@Param('id') id: string) {
    return this.sprintsService.startSprint(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete sprint' })
  completeSprint(@Param('id') id: string) {
    return this.sprintsService.completeSprint(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete sprint' })
  remove(@Param('id') id: string) {
    return this.sprintsService.remove(id);
  }
}
