import { BrowserCodeReader } from './BrowserCodeReader';
import { DecodeHintType } from '@zxing/library';
import { MultiformatReader } from '@zxing/library';

/**
 * Multiformat reader to use from browser.
 */
export class BrowserMultiformatReader extends BrowserCodeReader {
    /**
     * Creates an instance of BrowserMultiformatReader.
     *
     * @param timeBetweenScansMillis the time delay between subsequent decode tries
     */
    public constructor(
      timeBetweenScansMillis: number = 500,
      hints?: Map<DecodeHintType, any>,
    ) {
        hints = hints || new Map<DecodeHintType, any>();
        super(new MultiformatReader(hints), timeBetweenScansMillis, hints); 
    }
}
