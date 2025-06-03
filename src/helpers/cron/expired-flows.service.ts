import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Flow } from 'sequelize/models/flows';
import { Op } from 'sequelize';

@Injectable()
export class ExpiredFlowsService {
  private readonly logger = new Logger(ExpiredFlowsService.name);

  constructor(
    @InjectModel(Flow)
    private readonly flowModel: typeof Flow,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredFlows() {
    try {
      this.logger.log('Starting expired flows cleanup job');

      const currentDate = new Date();
      
      const expiredFlows = await this.flowModel.findAll({
        where: {
          endDate: {
            [Op.lt]: currentDate,
          },
        },
      });

      if (expiredFlows.length > 0) {
        await this.flowModel.destroy({
          where: {
            id: expiredFlows.map(flow => flow.id),
          },
        });

        this.logger.log(`Successfully deleted ${expiredFlows.length} expired flows`);
      } else {
        this.logger.log('No expired flows found');
      }
    } catch (error) {
      this.logger.error('Error while cleaning up expired flows:', error);
    }
  }
} 