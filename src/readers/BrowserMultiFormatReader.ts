import {
  BarcodeFormat,
  BinaryBitmap,
  DecodeHintType,
  MultiFormatReader,
  Result,
} from '@zxing/library';
import { BrowserCodeReader } from './BrowserCodeReader';

export class BrowserMultiFormatReader extends BrowserCodeReader {

  set possibleFormats(formats: BarcodeFormat[]) {
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    this.reader.setHints(this.hints);
  }

  protected readonly reader: MultiFormatReader;

  public constructor(
    hints?: Map<DecodeHintType, any>,
    delayBetweenScanSuccess: number = 500,
    delayBetweenScanAttempts: number = 500,
  ) {
    const reader = new MultiFormatReader();
    reader.setHints(hints);
    super(
      reader,
      delayBetweenScanSuccess,
      hints,
      delayBetweenScanAttempts,
    );
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
