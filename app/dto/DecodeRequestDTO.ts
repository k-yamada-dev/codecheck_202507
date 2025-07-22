export interface DecodeRequestDTO {
  inputFileName: string;
  blockSize: number;
  timer: number;
  widthScalingFrom: number;
  widthScalingTo: number;
  heightScalingFrom: number;
  heightScalingTo: number;
  rotationFrom: number;
  rotationTo: number;
  logfile: string;
}

interface RequestData {
  inputFileName?: string;
  blockSize?: number;
  timer?: number;
  widthScalingFrom?: number;
  widthScalingTo?: number;
  heightScalingFrom?: number;
  heightScalingTo?: number;
  rotationFrom?: number;
  rotationTo?: number;
  logfile?: string;
}

export class DecodeRequestDTOImpl implements DecodeRequestDTO {
  constructor(data: RequestData) {
    if (!data.inputFileName) {
      throw new Error('Input file name is required');
    }
    this.inputFileName = data.inputFileName;
    this.blockSize = data.blockSize || 8;
    this.timer = data.timer || 60;
    this.widthScalingFrom = data.widthScalingFrom || 0.5;
    this.widthScalingTo = data.widthScalingTo || 2.0;
    this.heightScalingFrom = data.heightScalingFrom || 0.5;
    this.heightScalingTo = data.heightScalingTo || 2.0;
    this.rotationFrom = data.rotationFrom || -45;
    this.rotationTo = data.rotationTo || 45;
    this.logfile = data.logfile || 'decode.log';
  }

  readonly inputFileName: string;
  readonly blockSize: number;
  readonly timer: number;
  readonly widthScalingFrom: number;
  readonly widthScalingTo: number;
  readonly heightScalingFrom: number;
  readonly heightScalingTo: number;
  readonly rotationFrom: number;
  readonly rotationTo: number;
  readonly logfile: string;
}
