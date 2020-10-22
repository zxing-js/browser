import { DecodeHintType, QRCodeReader } from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';

/**
 * QR Code reader to use from browser.
 */
export class BrowserQRCodeReader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserQRCodeReader.
   */
  public constructor(
    delayBetweenScanSuccess: number = 500,
    hints?: Map<DecodeHintType, any>,
    delayBetweenScanAttempts: number = 500,
  ) {
    super(
      new QRCodeReader(),
      delayBetweenScanSuccess,
      hints,
      delayBetweenScanAttempts,
    );
  }
}
