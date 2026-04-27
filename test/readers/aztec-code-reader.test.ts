import fs from 'fs';
import path from 'path';
import { BrowserAztecCodeReader } from '../../src/readers/BrowserAztecCodeReader';
import { decodeImageFile } from '../helpers/decode';

const FIXTURES = path.join(__dirname, '../fixtures/images/blackbox');

function expected(imagePath: string): string {
  return fs.readFileSync(imagePath.replace(/\.png$/, '.txt'), 'utf8');
}

describe('BrowserAztecCodeReader', () => {
  let reader: BrowserAztecCodeReader;

  beforeEach(() => {
    reader = new BrowserAztecCodeReader();
  });

  it('decodes blackbox aztec-1/7', async () => {
    const img = path.join(FIXTURES, 'aztec-1/7.png');
    expect(await decodeImageFile(reader, img)).toBe(expected(img));
  });

  it('decodes blackbox aztec-1/lorem-151x151', async () => {
    const img = path.join(FIXTURES, 'aztec-1/lorem-151x151.png');
    expect(await decodeImageFile(reader, img)).toBe(expected(img));
  });

  it('decodes blackbox aztec-2/01', async () => {
    const img = path.join(FIXTURES, 'aztec-2/01.png');
    expect(await decodeImageFile(reader, img)).toBe(expected(img));
  });

  // aztec-2/22 was skipped in the original suite (decoder timeout)
});
