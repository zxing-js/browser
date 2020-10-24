/// <reference types="cypress" />

context('QR Code Test Actions', () => {

  beforeEach(() => {
    cy.visit('http://localhost:8080/cypress/fixtures//index.html');
    it('has ZXing imported into window', () => {
      cy.window().should('have.property', 'ZXingBrowser');
    });
    it('creates code reader instance', () => {
      const codeReader = new win.ZXingBrowser.BrowserQRCodeReader();
      expect(codeReader).to.not.be.null;
    });
  });

  describe('Webcam tests', () => {
    it('gets mediaDevice and decodes', () => {
      cy.window().then(async (win) => {

        const expected = '192.168.1.13:3000';

        const codeReader = new win.ZXingBrowser.BrowserQRCodeReader();

        const videoInputDevices = await win.ZXingBrowser.BrowserCodeReader.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices[0].deviceId;

        console.log(`Started decode from camera with id ${selectedDeviceId}`);

        const previewElem = win.document.querySelector('#test-area-qr-code-webcam > video');
        const result = await codeReader.decodeOnceFromVideoDevice(selectedDeviceId, previewElem);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });
  });

  describe('Image tests', () => {

    it('decodes blackbox qrcode-3/01', () => {
      cy.window().then(async (win) => {

        const expected = 'http://arnaud.sahuguet.com/graffiti/test.php?ll=-74.00309961503218,40.74102573163046,0';

        const codeReader = new win.ZXingBrowser.BrowserQRCodeReader();

        const sourceElem = win.document.querySelector('#test-area-qr-code-image > img');
        const result = await codeReader.decodeFromImageElement(sourceElem);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

    it('decodes blackbox qrcode-3/01 via URL', () => {
      cy.window().then(async (win) => {

        const expected = 'http://arnaud.sahuguet.com/graffiti/test.php?ll=-74.00309961503218,40.74102573163046,0';

        const codeReader = new win.ZXingBrowser.BrowserQRCodeReader();

        const source = 'http://localhost:8080/cypress/fixtures//images/blackbox/qrcode-3/01.png';
        const result = await codeReader.decodeFromImageUrl(source);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

  });

  describe('Video tests', () => {

    it('decodes qrcode video', () => {
      cy.window().then(async (win) => {

        const expected = '192.168.1.13:3000';

        const codeReader = new win.ZXingBrowser.BrowserQRCodeReader();

        const sourceElem = win.document.querySelector('#test-area-qr-code-video > video');
        const result = await codeReader.decodeOnceFromVideoElement(sourceElem);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

    it('decodes qrcode video via URL', () => {
      cy.window().then(async (win) => {

        const expected = '192.168.1.13:3000';

        const codeReader = new win.ZXingBrowser.BrowserQRCodeReader();

        const source = 'http://localhost:8080/cypress/fixtures//videos/qrcode.mp4';
        const result = await codeReader.decodeOnceFromVideoUrl(source);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

  });

});
