import { AztecCodeReader, DecodeHintType } from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';
import { IBrowserCodeReaderOptions } from './IBrowserCodeReaderOptions';

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
    hints?: Map<DecodeHintType, any>,
    options?: IBrowserCodeReaderOptions,
  ) {
    super(new AztecCodeReader(), hints, options);
  }
}
