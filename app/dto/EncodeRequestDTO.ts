export interface EncodeRequestDTO {
  inputFileName: string;
  outputFileName: string;
  watermark: string;
  strength: number;
  blockSize: number;
  mode: string;
  enmode: string;
  quality: number;
  logfile: string;
}

interface RequestData {
  inputFileName?: string;
  outputFileName?: string;
  watermark?: string;
  strength?: number;
  blockSize?: number;
  mode?: string;
  enmode?: string;
  quality?: number;
  logfile?: string;
}

export class EncodeRequestDTOImpl implements EncodeRequestDTO {
  constructor(data: RequestData) {
    if (!data.inputFileName) {
      throw new Error('Input file name is required');
    }
    if (!data.outputFileName) {
      throw new Error('Output file name is required');
    }
    if (!data.watermark) {
      throw new Error('Watermark is required');
    }

    this.inputFileName = data.inputFileName;
    this.outputFileName = data.outputFileName;
    this.watermark = data.watermark;
    this.strength = data.strength || 50;
    this.blockSize = data.blockSize || 8;
    this.mode = data.mode || 'normal';
    this.enmode = data.enmode || 'standard';
    this.quality = data.quality || 90;
    this.logfile = data.logfile || 'encode.log';
  }

  readonly inputFileName: string;
  readonly outputFileName: string;
  readonly watermark: string;
  readonly strength: number;
  readonly blockSize: number;
  readonly mode: string;
  readonly enmode: string;
  readonly quality: number;
  readonly logfile: string;
}
