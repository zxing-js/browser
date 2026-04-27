import { createCanvas, loadImage } from 'canvas';
import { BrowserCodeReader } from '../../src/readers/BrowserCodeReader';

/**
 * Loads a PNG fixture from disk, draws it onto a node-canvas, and runs the
 * given reader's decodeFromCanvas on the result.  The node-canvas Canvas is
 * structurally compatible with HTMLCanvasElement for the purposes of
 * HTMLCanvasElementLuminanceSource (getContext / getImageData / width / height).
 */
export async function decodeImageFile(
  reader: BrowserCodeReader,
  imagePath: string,
): Promise<string> {
  const img = await loadImage(imagePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const result = reader.decodeFromCanvas(canvas as unknown as HTMLCanvasElement);
  return result.getText();
}
