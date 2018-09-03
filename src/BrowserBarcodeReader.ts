import { BrowserCodeReader } from './BrowserCodeReader';

import { DecodeHintType } from '@zxing/library';

import MultiFormatOneDReader from '@zxing/library/esm5/core/oned/MultiFormatOneDReader';

/**
 * Barcode reader reader to use from browser.
 */
export class BrowserBarcodeReader extends BrowserCodeReader {

    /**
     * Creates an instance of BrowserBarcodeReader.
     *
     * @param timeBetweenScansMillis the time delay between subsequent decode tries
     */
    public constructor(
        timeBetweenScansMillis: number = 500,
        hints?: Map<DecodeHintType, any>,
    ) {
        hints = hints || new Map<DecodeHintType, any>();
        super(new MultiFormatOneDReader(hints), timeBetweenScansMillis, hints);
    }
}
