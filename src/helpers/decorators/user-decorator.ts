import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { UserRole } from 'sequelize/models/user';

export interface userTokenData {
  id: number;
  role: UserRole;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
