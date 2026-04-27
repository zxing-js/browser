import path from 'path';
import { BrowserQRCodeReader } from '../../src/readers/BrowserQRCodeReader';
import { decodeImageFile } from '../helpers/decode';

const FIXTURES = path.join(__dirname, '../fixtures/images/blackbox');

describe('BrowserQRCodeReader', () => {
  let reader: BrowserQRCodeReader;

  beforeEach(() => {
    reader = new BrowserQRCodeReader();
  });

  it('decodes blackbox qrcode-3/01', async () => {
    const result = await decodeImageFile(
      reader,
      path.join(FIXTURES, 'qrcode-3/01.png'),
    );
    expect(result).toBe(
      'http://arnaud.sahuguet.com/graffiti/test.php?ll=-74.00309961503218,40.74102573163046,0',
    );
  });
});
