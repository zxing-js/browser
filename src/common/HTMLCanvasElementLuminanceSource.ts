import {
  IllegalArgumentException,
  InvertedLuminanceSource,
  LuminanceSource,
} from '@zxing/library';

/**/
export class HTMLCanvasElementLuminanceSource extends LuminanceSource {

  private static DEGREE_TO_RADIANS = Math.PI / 180;

  private static makeBufferFromCanvasImageData(canvas: HTMLCanvasElement): Uint8ClampedArray {
    let canvasCtx;

    try {
      canvasCtx = canvas.getContext('2d', { willReadFrequently: true });
    } catch {
      canvasCtx = canvas.getContext('2d');
    }

    if (!canvasCtx) { throw new Error('Couldn\'t get canvas context.'); }
    const imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
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
        gray = (306 * pixelR + 601 * pixelG + 117 * pixelB + 0x200) >> 10;
      }
      grayscaleBuffer[j] = gray;
    }
    return grayscaleBuffer;
  }

  private buffer: Uint8ClampedArray;

  public constructor(private canvas: HTMLCanvasElement) {
    super(canvas.width, canvas.height);
    this.buffer = HTMLCanvasElementLuminanceSource.makeBufferFromCanvasImageData(canvas);
  }

  public getRow(y: number /*int*/, row: Uint8ClampedArray): Uint8ClampedArray {
    if (y < 0 || y >= this.getHeight()) {
      throw new IllegalArgumentException('Requested row is outside the image: ' + y);
    }
    const width: number /*int*/ = this.getWidth();
    const start = y * width;
    if (row === null) {
      row = this.buffer.slice(start, start + width);
    } else {
      if (row.length < width) {
        row = new Uint8ClampedArray(width);
      }
      // The underlying raster of image consists of bytes with the luminance values
      // TODO: can avoid set/slice?
      row.set(this.buffer.slice(start, start + width));
    }

    return row;
  }

  public getMatrix(): Uint8ClampedArray {
    return this.buffer;
  }

  public isCropSupported(): boolean {
    return true;
  }

  public crop(
    left: number /*int*/,
    top: number /*int*/,
    width: number /*int*/,
    height: number /*int*/,
  ): LuminanceSource {
    super.crop(left, top, width, height);
    return this;
  }

  /**
   * Whether rotation is supported by this luminance source.
   *
   * @return true if a canvas element can be created to rotate the image data.
   */
  public isRotateSupported(): boolean {
    return Boolean(
      (this.canvas.ownerDocument && typeof this.canvas.ownerDocument.createElement === 'function') ||
      (typeof document !== 'undefined' && typeof document.createElement === 'function') ||
      (typeof OffscreenCanvas !== 'undefined' && this.canvas instanceof OffscreenCanvas) ||
      this.getCanvasConstructor()
    );
  }

  public rotateCounterClockwise(): LuminanceSource {
    return this.rotate(-90);
  }

  public rotateCounterClockwise45(): LuminanceSource {
    return this.rotate(-45);
  }

  public invert(): LuminanceSource {
    return new InvertedLuminanceSource(this);
  }

  private getCanvasConstructor(): (new (width: number, height: number) => HTMLCanvasElement) | undefined {
    const ctor = (this.canvas as unknown as { constructor?: unknown }).constructor;
    if (typeof ctor === 'function' && ctor !== Object && ctor !== Function) {
      return ctor as new (width: number, height: number) => HTMLCanvasElement;
    }
    return undefined;
  }

  private createCanvas(width: number, height: number): HTMLCanvasElement {
    let canvas: HTMLCanvasElement | undefined;
    if (this.canvas.ownerDocument && typeof this.canvas.ownerDocument.createElement === 'function') {
      canvas = this.canvas.ownerDocument.createElement('canvas');
    } else if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      canvas = document.createElement('canvas');
    } else if (typeof OffscreenCanvas !== 'undefined' && this.canvas instanceof OffscreenCanvas) {
      canvas = new OffscreenCanvas(width, height) as unknown as HTMLCanvasElement;
    } else {
      const ctor = this.getCanvasConstructor();
      if (ctor) {
        try {
          const constructed = new ctor(width, height);
          if (typeof constructed.getContext === 'function') {
            canvas = constructed;
          }
        } catch {
          // constructor invocation failed
        }
      }
    }

    if (!canvas) {
      throw new Error('Could not create a Canvas element.');
    }

    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  private rotate(angle: number): LuminanceSource {
    const angleRadians = angle * HTMLCanvasElementLuminanceSource.DEGREE_TO_RADIANS;

    // Calculate and set new dimensions for rotated canvas
    const width = this.canvas.width;
    const height = this.canvas.height;
    let cos = Math.abs(Math.cos(angleRadians));
    let sin = Math.abs(Math.sin(angleRadians));
    if (cos < 1e-10) { cos = 0; }
    if (sin < 1e-10) { sin = 0; }
    const newWidth = Math.ceil(cos * width + sin * height);
    const newHeight = Math.ceil(sin * width + cos * height);

    const rotatedCanvas = this.createCanvas(newWidth, newHeight);
    const rotatedContext = rotatedCanvas.getContext('2d');
    if (!rotatedContext) { throw new Error('Could not create a Canvas Context element.'); }

    rotatedContext.imageSmoothingEnabled = false;

    // Draw at center of rotated canvas to prevent clipping of image data
    rotatedContext.translate(newWidth / 2, newHeight / 2);
    rotatedContext.rotate(angleRadians);
    rotatedContext.drawImage(this.canvas, width / -2, height / -2);

    return new HTMLCanvasElementLuminanceSource(rotatedCanvas);
  }
}
