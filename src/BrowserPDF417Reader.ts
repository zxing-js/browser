import { DecodeHintType, PDF417Reader } from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';

/**
 * QR Code reader to use from browser.
 */
export class BrowserPDF417Reader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserPDF417Reader.
   */
  public constructor(
    delayBetweenScanSuccess: number = 500,
    hints?: Map<DecodeHintType, any>,
    delayBetweenScanAttempts: number = 500,
  ) {
    super(
      new PDF417Reader(),
      delayBetweenScanSuccess,
      hints,
      delayBetweenScanAttempts,
    );
  }
}
