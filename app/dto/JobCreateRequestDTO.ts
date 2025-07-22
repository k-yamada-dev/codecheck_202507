export interface JobCreateRequestDTO {
  type: 'EMBED' | 'DECODE';
  srcImagePath: string;
  thumbnailPath?: string;
  params: Record<string, any>;
}

interface RequestData {
  type?: 'EMBED' | 'DECODE';
  srcImagePath?: string;
  thumbnailPath?: string;
  params?: Record<string, any>;
}

export class JobCreateRequestDTOImpl implements JobCreateRequestDTO {
  constructor(data: RequestData) {
    if (!data.type) {
      throw new Error('Job type is required');
    }
    if (!data.srcImagePath) {
      throw new Error('Source image path is required');
    }
    if (!data.params) {
      throw new Error('Params are required');
    }

    this.type = data.type;
    this.srcImagePath = data.srcImagePath;
    this.thumbnailPath = data.thumbnailPath;
    this.params = data.params;
  }

  readonly type: 'EMBED' | 'DECODE';
  readonly srcImagePath: string;
  readonly thumbnailPath?: string;
  readonly params: Record<string, any>;
}
