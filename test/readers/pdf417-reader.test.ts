import path from 'path';
import { BrowserPDF417Reader } from '../../src/readers/BrowserPDF417Reader';
import { decodeImageFile } from '../helpers/decode';

const FIXTURES = path.join(__dirname, '../fixtures/images/blackbox');

describe('BrowserPDF417Reader', () => {
  let reader: BrowserPDF417Reader;

  beforeEach(() => {
    reader = new BrowserPDF417Reader();
  });

  it('decodes blackbox pdf417-2/05', async () => {
    const result = await decodeImageFile(reader, path.join(FIXTURES, 'pdf417-2/05.png'));
    expect(result).toBe('1234567890');
  });

  it('decodes blackbox pdf417-2/15', async () => {
    const result = await decodeImageFile(reader, path.join(FIXTURES, 'pdf417-2/15.png'));
    expect(result).toBe('A PDF 417 barcode with ASCII text');
  });

  it('decodes blackbox pdf417-3/08', async () => {
    const result = await decodeImageFile(reader, path.join(FIXTURES, 'pdf417-3/08.png'));
    expect(result).toBe('A larger PDF417 barcode with text and error correction level 4.');
  });
});
