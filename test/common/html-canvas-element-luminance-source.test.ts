import { createCanvas } from 'canvas';
import {
  BarcodeFormat,
  DecodeHintType,
  NotFoundException,
} from '@zxing/library';
import { HTMLCanvasElementLuminanceSource } from '../../src/common/HTMLCanvasElementLuminanceSource';
import { BrowserMultiFormatOneDReader } from '../../src/readers/BrowserMultiFormatOneDReader';

const L_PATTERNS = [
  '0001101', '0011001', '0010011', '0111101', '0100011',
  '0110001', '0101111', '0111011', '0110111', '0001011',
];
const G_PATTERNS = [
  '0100111', '0110011', '0011011', '0100001', '0011101',
  '0111001', '0000101', '0010001', '0001001', '0010111',
];
const R_PATTERNS = [
  '1110010', '1100110', '1101100', '1000010', '1011100',
  '1001110', '1010000', '1000100', '1001000', '1110100',
];
const PARITY_ENCODINGS = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL',
];

function encodeEan13(code: string): string {
  const first = Number(code[0]);
  const parity = PARITY_ENCODINGS[first];
  let bits = '101'; // start guard
  for (let i = 0; i < 6; i++) {
    const digit = Number(code[i + 1]);
    bits += parity[i] === 'L' ? L_PATTERNS[digit] : G_PATTERNS[digit];
  }
  bits += '01010'; // center guard
  for (let i = 0; i < 6; i++) {
    const digit = Number(code[i + 7]);
    bits += R_PATTERNS[digit];
  }
  bits += '101'; // end guard
  return bits;
}

function createVerticalEan13Canvas(code: string): HTMLCanvasElement {
  const bits = encodeEan13(code);
  const scale = 3;
  const quietZone = 15;
  const barcodeLength = (bits.length + quietZone * 2) * scale;
  const barcodeBarHeight = 100;

  // The barcode is oriented vertically (bars are horizontal lines)
  const canvas = createCanvas(barcodeBarHeight, barcodeLength);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, barcodeBarHeight, barcodeLength);
  ctx.fillStyle = '#000000';

  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1') {
      ctx.fillRect(10, (quietZone + i) * scale, barcodeBarHeight - 20, scale);
    }
  }

  return canvas as unknown as HTMLCanvasElement;
}

describe('HTMLCanvasElementLuminanceSource', () => {
  describe('Rotation bug regression and basic behavior', () => {
    it('does not throw when calling rotateCounterClockwise or rotateCounterClockwise45', () => {
      const canvas = createCanvas(4, 2);
      const source = new HTMLCanvasElementLuminanceSource(canvas as unknown as HTMLCanvasElement);

      expect(() => source.rotateCounterClockwise()).not.toThrow();
      expect(() => source.rotateCounterClockwise45()).not.toThrow();
    });

    it('correctly reports isRotateSupported', () => {
      const canvas = createCanvas(4, 2);
      const source = new HTMLCanvasElementLuminanceSource(canvas as unknown as HTMLCanvasElement);
      expect(source.isRotateSupported()).toBe(true);

      const fakeCanvasWithoutConstructor = {
        width: 10,
        height: 10,
        getContext: () => ({
          getImageData: () => ({ data: new Uint8ClampedArray(400) }),
        }),
      } as unknown as HTMLCanvasElement;
      Object.setPrototypeOf(fakeCanvasWithoutConstructor, null);

      const unsupportedSource = new HTMLCanvasElementLuminanceSource(
        fakeCanvasWithoutConstructor,
      );
      expect(unsupportedSource.isRotateSupported()).toBe(false);
      expect(() => unsupportedSource.rotateCounterClockwise()).toThrow(
        'Could not create a Canvas element.',
      );
    });

    it('uses ownerDocument.createElement when available', () => {
      const canvas = createCanvas(6, 4) as unknown as HTMLCanvasElement;
      const createdCanvases: HTMLCanvasElement[] = [];

      (canvas as unknown as { ownerDocument: { createElement: (tag: string) => HTMLCanvasElement } }).ownerDocument = {
        createElement: (tag: string) => {
          expect(tag).toBe('canvas');
          const created = createCanvas(1, 1) as unknown as HTMLCanvasElement;
          createdCanvases.push(created);
          return created;
        },
      };

      const source = new HTMLCanvasElementLuminanceSource(canvas);
      const rotated = source.rotateCounterClockwise();

      expect(createdCanvases.length).toBe(1);
      expect(rotated.getWidth()).toBe(4);
      expect(rotated.getHeight()).toBe(6);
    });
  });

  describe('Dimensions and immutability', () => {
    it('swaps width and height when rotating 90 degrees counter-clockwise', () => {
      const canvas = createCanvas(6, 4);
      const source = new HTMLCanvasElementLuminanceSource(canvas as unknown as HTMLCanvasElement);

      expect(source.getWidth()).toBe(6);
      expect(source.getHeight()).toBe(4);

      const rotated = source.rotateCounterClockwise();
      expect(rotated.getWidth()).toBe(4);
      expect(rotated.getHeight()).toBe(6);
    });

    it('does not mutate the original luminance source instance', () => {
      const canvas = createCanvas(6, 4);
      const source = new HTMLCanvasElementLuminanceSource(canvas as unknown as HTMLCanvasElement);

      const originalWidth = source.getWidth();
      const originalHeight = source.getHeight();
      const originalMatrix = source.getMatrix().slice();

      const rotated = source.rotateCounterClockwise();

      expect(rotated).not.toBe(source);
      expect(source.getWidth()).toBe(originalWidth);
      expect(source.getHeight()).toBe(originalHeight);
      expect(source.getMatrix()).toEqual(originalMatrix);
    });
  });

  describe('Pixel mapping and additive rotation', () => {
    it('maps pixels correctly on 90 degree CCW rotation', () => {
      // Create a 20x10 canvas: left half black, right half white
      const canvas = createCanvas(20, 10);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 10, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 0, 10, 10);

      const source = new HTMLCanvasElementLuminanceSource(canvas as unknown as HTMLCanvasElement);
      const rotated = source.rotateCounterClockwise();

      // Rotated dimensions should be 10 x 20
      expect(rotated.getWidth()).toBe(10);
      expect(rotated.getHeight()).toBe(20);

      // Rotating 90° CCW maps left half to bottom half, right half to top half:
      // Top half (y = 0..9) should be white (luminance ~ 255)
      // Bottom half (y = 10..19) should be black (luminance ~ 0)
      for (let y = 0; y < 10; y++) {
        const row = rotated.getRow(y, new Uint8ClampedArray(10));
        for (let x = 0; x < 10; x++) {
          expect(row[x]).toBe(255);
        }
      }

      for (let y = 10; y < 20; y++) {
        const row = rotated.getRow(y, new Uint8ClampedArray(10));
        for (let x = 0; x < 10; x++) {
          expect(row[x]).toBe(0);
        }
      }
    });

    it('correctly composes successive rotations (two 90 degree CCW = 180 degrees)', () => {
      // Create a 20x10 canvas: left half black, right half white
      const canvas = createCanvas(20, 10);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 10, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 0, 10, 10);

      const source = new HTMLCanvasElementLuminanceSource(canvas as unknown as HTMLCanvasElement);
      const rotated90 = source.rotateCounterClockwise();
      const rotated180 = rotated90.rotateCounterClockwise();

      expect(rotated180.getWidth()).toBe(20);
      expect(rotated180.getHeight()).toBe(10);

      // Rotated 180°: Left half becomes white (255), Right half becomes black (0)
      for (let y = 0; y < 10; y++) {
        const row = rotated180.getRow(y, new Uint8ClampedArray(20));
        for (let x = 0; x < 10; x++) {
          expect(row[x]).toBe(255);
        }
        for (let x = 10; x < 20; x++) {
          expect(row[x]).toBe(0);
        }
      }
    });
  });

  describe('Integration with 1D readers and TRY_HARDER', () => {
    it('decodes a vertically oriented EAN-13 barcode when TRY_HARDER is enabled', () => {
      const code = '9783548283951';
      const canvas = createVerticalEan13Canvas(code);

      const hints = new Map<DecodeHintType, unknown>([
        [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]],
        [DecodeHintType.TRY_HARDER, true],
      ]);
      const reader = new BrowserMultiFormatOneDReader(hints);
      const result = reader.decodeFromCanvas(canvas);

      expect(result.getText()).toBe(code);
    });

    it('throws NotFoundException on vertical EAN-13 when TRY_HARDER is not enabled', () => {
      const code = '9783548283951';
      const canvas = createVerticalEan13Canvas(code);

      const hints = new Map<DecodeHintType, unknown>([
        [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]],
      ]);
      const reader = new BrowserMultiFormatOneDReader(hints);

      expect(() => reader.decodeFromCanvas(canvas)).toThrow(NotFoundException);
    });

    it('throws NotFoundException (not generic Error) on empty canvas with TRY_HARDER', () => {
      const emptyCanvas = createCanvas(100, 100) as unknown as HTMLCanvasElement;

      const hints = new Map<DecodeHintType, unknown>([
        [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]],
        [DecodeHintType.TRY_HARDER, true],
      ]);
      const reader = new BrowserMultiFormatOneDReader(hints);

      expect(() => reader.decodeFromCanvas(emptyCanvas)).toThrow(NotFoundException);
    });
  });
});
