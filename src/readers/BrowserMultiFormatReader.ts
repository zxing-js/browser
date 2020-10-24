import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  MultiFormatReader,
  Result,
} from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';
import { IBrowserCodeReaderOptions } from './IBrowserCodeReaderOptions';

export class BrowserMultiFormatReader extends BrowserCodeReader {

  set possibleFormats(formats: BarcodeFormat[]) {
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    this.reader.setHints(this.hints);
  }

  protected readonly reader: MultiFormatReader;

  public constructor(
    hints?: Map<DecodeHintType, any>,
    options?: IBrowserCodeReaderOptions,
  ) {
    const reader = new MultiFormatReader();
    reader.setHints(hints);
    super(reader, hints, options);
    this.reader = reader;
  }

  /**
   * Overwrite decodeBitmap to call decodeWithState, which will pay
   * attention to the hints set in the constructor function
   */
  public decodeBitmap(binaryBitmap: BinaryBitmap): Result {
    return this.reader.decodeWithState(binaryBitmap);
  }

  /**
   * Allows to change hints in runtime.
   */
  public setHints(hints: Map<DecodeHintType, any>) {
    this.hints = hints;
    this.reader.setHints(this.hints);
  }
}
