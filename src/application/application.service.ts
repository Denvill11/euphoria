import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  ApplicationStatus,
  OrganizationApplication,
  OrganizationStatus,
} from 'sequelize/models/organizationApplications';
import { User, UserRole } from 'sequelize/models/user';
import { HttpRequestService } from 'src/common/http-request-service';
import { Errors } from 'src/helpers/constants/errorMessages';
import { userTokenData } from 'src/helpers/decorators/user-decorator';

export interface DadataOrganizationInfo {
  value: string;
  data: {
    state: {
      status: OrganizationStatus;
    };
  };
}

@Injectable()
export class ApplicationService extends HttpRequestService {
  constructor(
    @InjectModel(OrganizationApplication)
    private readonly applicationData: typeof OrganizationApplication,
    @InjectModel(User) private readonly userRepo: typeof User,
  ) {
    super();
  }

  async createApplication(userId: number, innOrOgrn: string) {
    if (innOrOgrn.length < 10) {
      throw new HttpException(Errors.innOrOgrn, HttpStatus.BAD_REQUEST);
    }

    await this.checkExistsApplication(userId);

    const applicationDataCreate = {
      userId,
      innOrOgrn,
    };

    const { id } = await this.applicationData.create(
      applicationDataCreate as OrganizationApplication,
    );

    const organizationInfo = await this.getCompanyData(innOrOgrn);

    const status = this.checkValidStatus(organizationInfo);

    const updateApplicationData = {
      organizationName: organizationInfo?.value || 'unknown',
      organizationStatus: status,
      autoApproval: status === OrganizationStatus.ACTIVE ? true : false,
    };

    const resultApplication = await this.applicationData.update(
      updateApplicationData,
      {
        where: { id },
        returning: true,
      },
    );

    return resultApplication[1];
  }

  async getCompanyData(query: string) {
    const token = {
      Authorization: `Token ${process.env.DADATA_TOKEN}`,
    };

    const response = await this.request<{
      suggestions: DadataOrganizationInfo[];
    }>('POST', process.env.DADATA_URL!, { query }, token);
    return response?.suggestions[0];
  }

  async checkExistsApplication(userId: number) {
    const existingApplication = await this.applicationData.findOne({
      where: { userId },
    });

    if (existingApplication) {
      throw new HttpException(Errors.applicationExists, HttpStatus.BAD_REQUEST);
    }
  }

  checkValidStatus(
    organizationInfo: DadataOrganizationInfo,
  ): OrganizationStatus | undefined {
    const status = organizationInfo.data.state.status?.toLowerCase();

    if (!status) {
      return OrganizationStatus.PENDING;
    }

    if (
      !Object.values(OrganizationStatus).includes(status as OrganizationStatus)
    ) {
      throw new HttpException(
        `Unknown organization incorrect: ${status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return status as OrganizationStatus;
  }

  async getAll(
    user: userTokenData,
    filters?: {
      organizationStatus?: OrganizationStatus;
      adminApprove?: ApplicationStatus;
    },
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
      return await this.applicationData.findAll({
        where,
        include: [
          {
            model: User,
            attributes: ['id', 'email', 'name', 'surname', 'role'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    }

    return await this.applicationData.findAll({
      where: Object.keys(where).length > 0 ? where : undefined
    });
  }

  async updateApplicationStatus(
    applicationId: number,
    status: ApplicationStatus,
  ) {
    const application = await this.applicationData.findByPk(applicationId);

    if (!application) {
      throw new HttpException(Errors.notFounApplication, HttpStatus.NOT_FOUND);
    }

    const userId = application.dataValues.userId;

    if (status === ApplicationStatus.APPROVED) {
      await this.userRepo.update(
        { role: UserRole.ORGANIZER },
        { where: { id: userId } }
      );
    }

    application.dataValues.adminApprove = status;
    await application.save();

    return application;
  }
}
