import { UserRole } from "sequelize/models/user";

export interface whoamiType extends Request {
  readonly user: {
    id: number;
    userRole: UserRole;
  };
}
