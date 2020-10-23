import { DecodeHintType, QRCodeReader } from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';
import { IBrowserCodeReaderOptions } from './IBrowserCodeReaderOptions';

/**
 * QR Code reader to use from browser.
 */
export class BrowserQRCodeReader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserQRCodeReader.
   */
  public constructor(
    hints?: Map<DecodeHintType, any>,
    options?: IBrowserCodeReaderOptions,
  ) {
    super(new QRCodeReader(), hints, options);
  }
}
