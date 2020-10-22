import { AztecCodeReader, DecodeHintType } from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';

/**
 * Aztec Code reader to use from browser.
 *
 * @class BrowserAztecCodeReader
 * @extends {BrowserCodeReader}
 */
export class BrowserAztecCodeReader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserAztecCodeReader.
   */
  public constructor(
    delayBetweenScanSuccess: number = 500,
    hints?: Map<DecodeHintType, any>,
    delayBetweenScanAttempts: number = 500,
  ) {
    super(
      new AztecCodeReader(),
      delayBetweenScanSuccess,
      hints,
      delayBetweenScanAttempts,
    );
  }
}
