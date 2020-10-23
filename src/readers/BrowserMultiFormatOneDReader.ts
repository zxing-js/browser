import { DecodeHintType, MultiFormatOneDReader } from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';
import {IBrowserCodeReaderOptions} from './IBrowserCodeReaderOptions';

/**
 * Reader to be used for any One Dimension type barcode.
 */
export class BrowserMultiFormatOneDReader extends BrowserCodeReader {
  /**
   * Creates an instance of BrowserBarcodeReader.
   * @param {Map<DecodeHintType, any>} hints?
   * @param options
   */
  public constructor(hints?: Map<DecodeHintType, any>, options?: IBrowserCodeReaderOptions) {
    super(new MultiFormatOneDReader(hints), hints, options);
  }
}
