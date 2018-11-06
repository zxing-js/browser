import {
    IllegalArgumentException,
    InvertedLuminanceSource,
    LuminanceSource,
} from '@zxing/library';

export class HTMLCanvasElementLuminanceSource extends LuminanceSource {

    private static DEGREE_TO_RADIANS = Math.PI / 180;

    private static makeBufferFromCanvasImageData(canvas: HTMLCanvasElement): Uint8ClampedArray {

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not get the canvas context.');
        }

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        return HTMLCanvasElementLuminanceSource.toGrayscaleBuffer(imageData.data, canvas.width, canvas.height);
    }

    private static toGrayscaleBuffer(imageBuffer: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {

        const grayscaleBuffer = new Uint8ClampedArray(width * height);

        for (let i = 0, j = 0, length = imageBuffer.length; i < length; i += 4, j++) {

            let gray;
            const alpha = imageBuffer[i + 3];

            // The color of fully-transparent pixels is irrelevant. They are often, technically, fully-transparent
            // black (0 alpha, and then 0 RGB). They are often used, of course as the "white" area in a
            // barcode image. Force any such pixel to be white:
            if (alpha === 0) {
                gray = 0xFF;
            } else {
                const pixelR = imageBuffer[i];
                const pixelG = imageBuffer[i + 1];
                const pixelB = imageBuffer[i + 2];
                // .299R + 0.587G + 0.114B (YUV/YIQ for PAL and NTSC),
                // (306*R) >> 10 is approximately equal to R*0.299, and so on.
                // 0x200 >> 10 is 0.5, it implements rounding.
                // tslint:disable-next-line:no-bitwise
                gray = (
                    306 * pixelR +
                    601 * pixelG +
                    117 * pixelB +
                    0x200
                ) >> 10;
            }

            grayscaleBuffer[j] = gray;
        }

        return grayscaleBuffer;
    }

    private buffer: Uint8ClampedArray;

    private tempCanvasElement!: HTMLCanvasElement;

    public constructor(
        private canvas: HTMLCanvasElement,
    ) {
        super(canvas.width, canvas.height);
        this.buffer = HTMLCanvasElementLuminanceSource.makeBufferFromCanvasImageData(canvas);
    }

    /**
     * Crops the source in the way you want.
     *
     * @param left Left offset.
     * @param top Top offset.
     * @param width Crop area width.
     * @param height Crop are height.
     */
    public crop(
        left: number,
        top: number,
        width: number,
        height: number,
    ): LuminanceSource {
        this.crop(left, top, width, height);
        return this;
    }

    public getRow(y: number, row: Uint8ClampedArray): Uint8ClampedArray {

        if (y < 0 || y >= this.getHeight()) {
            throw new IllegalArgumentException('Requested row is outside the image: ' + y);
        }

        const width: number = this.getWidth();
        const start = y * width;

        if (row === null) {
            return this.buffer.slice(start, start + width);
        }

        if (row.length < width) {
            row = new Uint8ClampedArray(width);
        }

        // The underlying raster of image consists of bytes with the luminance values
        // TODO: can avoid set/slice?
        row.set(this.buffer.slice(start, start + width));

        return row;
    }

    public getMatrix(): Uint8ClampedArray {
        return this.buffer;
    }

    /**
     * Indicates if crop is supported by this class.
     */
    public isCropSupported(): boolean {
        return true;
    }

    /**
     * Inverts the luminance source.
     */
    public invert(): LuminanceSource {
        return new InvertedLuminanceSource(this);
    }

    /**
     * This is always true, since the image is a gray-scale image.
     */
    public isRotateSupported(): boolean {
        return true;
    }

    /**
     * Returns the canvas element.
     */
    private getTempCanvasElement() {

        if (!this.tempCanvasElement) {

            const tempCanvasElement = this.canvas.ownerDocument.createElement('canvas');

            tempCanvasElement.width = this.canvas.width;
            tempCanvasElement.height = this.canvas.height;

            this.tempCanvasElement = tempCanvasElement;
        }

        return this.tempCanvasElement;
    }

    /**
     * Rotates the image.
     *
     * @param angle Angle in integer degress to rotate the image.
     */
    private rotate(angle: number) {

        const tempCanvasElement = this.getTempCanvasElement();
        const tempContext = tempCanvasElement.getContext('2d');

        if (!tempContext) {
            throw new Error('Could not get the current canvas context.');
        }

        // Calculate and set new dimensions for temp canvas
        const angleRadians = angle * HTMLCanvasElementLuminanceSource.DEGREE_TO_RADIANS;
        const width = tempCanvasElement.width;
        const height = tempCanvasElement.height;
        const newWidth = Math.ceil( Math.abs(Math.cos(angleRadians)) * width + Math.abs(Math.sin(angleRadians)) * height );
        const newHeight = Math.ceil( Math.abs(Math.sin(angleRadians)) * width + Math.abs(Math.cos(angleRadians)) * height );
        tempCanvasElement.width = newWidth;
        tempCanvasElement.height = newHeight;

        // Draw at center of temp canvas to prevent clipping of image data
        tempContext.translate(newWidth / 2, newHeight / 2);
        tempContext.rotate(angleRadians);
        tempContext.drawImage(this.canvas, width / -2, height / -2);

        this.buffer = HTMLCanvasElementLuminanceSource.makeBufferFromCanvasImageData(tempCanvasElement);

        return this;
    }
}
