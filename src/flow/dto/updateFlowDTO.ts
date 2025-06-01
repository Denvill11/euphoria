import { PartialType } from '@nestjs/swagger';

import { CreateFlowDto } from './createFlowDTO';

export class UpdateFlowDto extends PartialType(CreateFlowDto) {}
