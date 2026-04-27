import * as ZXingBrowser from '../src/index';

describe('Public exports', () => {
  it('exports reader classes', () => {
    expect(ZXingBrowser.BrowserCodeReader).toBeDefined();
    expect(ZXingBrowser.BrowserQRCodeReader).toBeDefined();
    expect(ZXingBrowser.BrowserAztecCodeReader).toBeDefined();
    expect(ZXingBrowser.BrowserDatamatrixCodeReader).toBeDefined();
    expect(ZXingBrowser.BrowserMultiFormatReader).toBeDefined();
    expect(ZXingBrowser.BrowserMultiFormatOneDReader).toBeDefined();
    expect(ZXingBrowser.BrowserPDF417Reader).toBeDefined();
  });

  it('exports writer classes', () => {
    expect(ZXingBrowser.BrowserQRCodeSvgWriter).toBeDefined();
  });

  it('reader classes can be instantiated', () => {
    expect(new ZXingBrowser.BrowserQRCodeReader()).toBeTruthy();
    expect(new ZXingBrowser.BrowserAztecCodeReader()).toBeTruthy();
    expect(new ZXingBrowser.BrowserDatamatrixCodeReader()).toBeTruthy();
    expect(new ZXingBrowser.BrowserMultiFormatReader()).toBeTruthy();
    expect(new ZXingBrowser.BrowserMultiFormatOneDReader()).toBeTruthy();
    expect(new ZXingBrowser.BrowserPDF417Reader()).toBeTruthy();
  });
});
