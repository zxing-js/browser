import {
  BinaryBitmap,
  DecodeHintType,
  MultiFormatReader,
  Result,
} from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';

export class BrowserMultiFormatReader extends BrowserCodeReader {

  protected readonly reader: MultiFormatReader;

  public constructor(
    hints: Map<DecodeHintType, any> | undefined = undefined,
    timeBetweenScansMillis: number = 500,
  ) {
    const reader = new MultiFormatReader();
    reader.setHints(hints);
    super(reader, timeBetweenScansMillis);
    this.reader = reader;
  }

  /**
   * Overwrite decodeBitmap to call decodeWithState, which will pay
   * attention to the hints set in the constructor function
   */
  public decodeBitmap(binaryBitmap: BinaryBitmap): Result {
    return this.reader.decodeWithState(binaryBitmap);
  }
}
