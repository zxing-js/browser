import { AztecCodeReader } from '@zxing/library';
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
   * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
   *
   * @memberOf BrowserAztecCodeReader
   */
  public constructor(timeBetweenScansMillis: number = 500) {
    super(new AztecCodeReader(), timeBetweenScansMillis);
  }
}
