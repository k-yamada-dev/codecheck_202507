import { JobType, JobStatus } from '@prisma/client';

export interface JobCreateDataDTO {
  type: JobType;
  status: JobStatus;
  srcImagePath: string;
  thumbnailPath?: string;
  params: Record<string, any>;
  result: Record<string, any>;
  tenantId: string;
  userId: string;
  userName: string;
}

export class JobCreateDataDTOImpl implements JobCreateDataDTO {
  constructor(
    type: JobType,
    srcImagePath: string,
    params: Record<string, any>,
    tenantId: string,
    userId: string,
    userName: string,
    thumbnailPath?: string,
    status: JobStatus = 'PENDING',
    result: Record<string, any> = {}
  ) {
    this.type = type;
    this.status = status;
    this.srcImagePath = srcImagePath;
    this.thumbnailPath = thumbnailPath;
    this.params = params;
    this.result = result;
    this.tenantId = tenantId;
    this.userId = userId;
    this.userName = userName;
  }

  readonly type: JobType;
  readonly status: JobStatus;
  readonly srcImagePath: string;
  readonly thumbnailPath?: string;
  readonly params: Record<string, any>;
  readonly result: Record<string, any>;
  readonly tenantId: string;
  readonly userId: string;
  readonly userName: string;
}
