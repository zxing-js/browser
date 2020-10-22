import { DecodeHintType, MultiFormatOneDReader } from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';

/**
 * Barcode reader reader to use from browser.
 */
export class BrowserBarcodeReader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserBarcodeReader.
   * @param {number} [timeBetweenScansMillis=500] the time delay between subsequent decode tries
   * @param {Map<DecodeHintType, any>} hints
   */
  public constructor(timeBetweenScansMillis: number = 500, hints?: Map<DecodeHintType, any>) {
    super(new MultiFormatOneDReader(hints), timeBetweenScansMillis, hints);
  }
}
