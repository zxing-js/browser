import { DataMatrixReader, DecodeHintType } from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';
import { IBrowserCodeReaderOptions } from './IBrowserCodeReaderOptions';

/**
 * QR Code reader to use from browser.
 */
export class BrowserDatamatrixCodeReader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserQRCodeReader.
   */
  public constructor(
    hints?: Map<DecodeHintType, any>,
    options?: IBrowserCodeReaderOptions,
  ) {
    super(new DataMatrixReader(), hints, options);
  }
}
