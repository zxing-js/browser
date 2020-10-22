import { DataMatrixReader, DecodeHintType } from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';

/**
 * QR Code reader to use from browser.
 */
export class BrowserDatamatrixCodeReader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserQRCodeReader.
   */
  public constructor(
    delayBetweenScanSuccess: number = 500,
    hints?: Map<DecodeHintType, any>,
    delayBetweenScanAttempts: number = 500,
  ) {
    super(
      new DataMatrixReader(),
      delayBetweenScanSuccess,
      hints,
      delayBetweenScanAttempts,
    );
  }
}
