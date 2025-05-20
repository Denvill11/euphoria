import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Flow } from 'sequelize/models/flows';
import { CreateFlowDto } from './dto/createFlowDTO';
import { UpdateFlowDto } from './dto/updateFlowDTO';
import { userTokenData } from 'src/helpers/decorators/user-decorator';

@Injectable()
export class FlowService {
  constructor(@InjectModel(Flow) private readonly flowRepo: typeof Flow) {}

  async create(dto: CreateFlowDto, user: userTokenData): Promise<Flow> {
    return this.flowRepo.create(dto as Flow);
  }

  async findAll(): Promise<Flow[]> {
    return this.flowRepo.findAll();
  }

  async findOne(id: number) {
    const flow = await this.flowRepo.findByPk(id);
    if (!flow) {
      throw new NotFoundException('Flow not found');
    }
    return flow;
  }

  async update(id: number, dto: UpdateFlowDto, user: userTokenData): Promise<Flow> {
    const flow = await this.findOne(id);
    return flow.update(dto);
  }

  async remove(id: number, user: userTokenData): Promise<void> {
    const flow = await this.findOne(id);
    await flow.destroy();
  }
}
