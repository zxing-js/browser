import { DecodeHintType, PDF417Reader } from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';
import { IBrowserCodeReaderOptions } from './IBrowserCodeReaderOptions';

/**
 * QR Code reader to use from browser.
 */
export class BrowserPDF417Reader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserPDF417Reader.
   */
  public constructor(
    hints?: Map<DecodeHintType, any>,
    options?: IBrowserCodeReaderOptions,
  ) {
    super(new PDF417Reader(), hints, options);
  }
}
