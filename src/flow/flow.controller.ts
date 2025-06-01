import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FlowService } from './flow.service';
import { AuthGuard } from 'src/helpers/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateFlowDto } from './dto/createFlowDTO';
import { UpdateFlowDto } from './dto/updateFlowDTO';
import { Organizer } from 'src/helpers/guards/organizer.guard';
import { User, userTokenData } from 'src/helpers/decorators/user-decorator';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('flows')
export class FlowController {
  constructor(private readonly flowService: FlowService) {}

  @UseGuards(Organizer)
  @Post()
  create(@Body() createFlowDto: CreateFlowDto, @User() user: userTokenData) {
    return this.flowService.create(createFlowDto, user);
  }

  @Get()
  findAll() {
    return this.flowService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.flowService.findOne(id);
  }

  @UseGuards(Organizer)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFlowDto: UpdateFlowDto,
    @User() user: userTokenData,
  ) {
    return this.flowService.update(id, updateFlowDto, user);
  }

  @UseGuards(Organizer)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @User() user: userTokenData) {
    return this.flowService.remove(id, user);
  }
}
