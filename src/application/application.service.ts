import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import axios from "axios";
import { ApplicationStatus, OrganizationApplication, OrganizationStatus } from "sequelize/models/organizationApplications";
import { User, UserRole } from "sequelize/models/user";
import { Errors } from "src/helpers/constants/errorMessages";
import { userTokenData } from "src/helpers/decorators/user-decorator";

export interface DadataOrganizationInfo {
  value: string;
  data: {
    state: {
      status: OrganizationStatus;
    };
  };
}

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(OrganizationApplication) private readonly applicationData: typeof OrganizationApplication,
    @InjectModel(User) private readonly userRepo: typeof User,
  ) {}

  //TODO think about rmq
  async createApplication(userId: number, innOrOgrn: string) {
    if(innOrOgrn.length < 10) {
      throw new HttpException(Errors.innOrOgrn, HttpStatus.BAD_REQUEST)
    }

    await this.checkExistsApplication(userId);

    const applicationDataCreate = {
      userId,
      innOrOgrn,
    }

    const { id } = await this.applicationData.create(applicationDataCreate as OrganizationApplication)

    const organizationInfo = await this.getCompanyData(innOrOgrn);

    const status = this.checkValidStatus(organizationInfo)

    const updateApplicationData = {
      organizationName: organizationInfo?.value || 'unknown',
      organizationStatus: status,
      autoApproval: status === OrganizationStatus.ACTIVE ? true : false,
    }

    const resultApplication = await this.applicationData.update(updateApplicationData, {
      where: { id }, 
      returning: true,
    });

    return resultApplication[1]; 
  }

  async getCompanyData(query: string) {
    const token = {
      'Authorization': `Token ${process.env.DADATA_TOKEN}`,
    }
  
    try {
      const response = await axios.post(process.env.DADATA_URL!, { query }, { headers: token });
      return response?.data?.suggestions[0];
    } catch (error) {
      throw new HttpException(Errors.remoteApi, HttpStatus.BAD_REQUEST)
    }
  }

  async  checkExistsApplication(userId: number) {
    const existingApplication = await this.applicationData.findOne({
      where: { userId },
    });

    if(existingApplication) {
      throw new HttpException(Errors.applicationExists, HttpStatus.BAD_REQUEST)
    }
  }

  checkValidStatus(organizationInfo: DadataOrganizationInfo): OrganizationStatus | undefined {
    const status = organizationInfo.data.state.status?.toLowerCase();

    if(!status) {
      return OrganizationStatus.PENDING;
    }

    if (!Object.values(OrganizationStatus).includes(status as OrganizationStatus)) {
      throw new HttpException(`Unknown organization incorrect: ${status}`, HttpStatus.BAD_REQUEST);
    }

    return status as OrganizationStatus;
  }

  async getAll(
    user: userTokenData,
    filters?: { organizationStatus?: OrganizationStatus; adminApprove?: ApplicationStatus },
  ) {
    const where: any = {};
  
    if (filters?.organizationStatus) {
      where.organizationStatus = filters.organizationStatus;
    }
  
    if (filters?.adminApprove) {
      where.adminApprove = filters.adminApprove;
    }
  
    if (user.role !== UserRole.ADMIN) {
      where.userId = user.id;
    }
  
    return await this.applicationData.findAll({ where });
  }

  async updateApplicationStatus(applicationId: number, status: ApplicationStatus) {
    const application = await this.applicationData.findByPk(applicationId);

  if (!application) {
    throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
  }

  const userId = application.dataValues.userId
  const user = await this.userRepo.findByPk(userId);

  if(user?.role === UserRole.USER) {
    await this.userRepo.update({role: UserRole.ORGANIZER}, { where: { id: userId } })
  }

  application.adminApprove = status;
  await application.save();

  return application;
  }
}
