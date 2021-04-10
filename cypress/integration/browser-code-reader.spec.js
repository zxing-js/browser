/// <reference types="cypress" />

context('Browser Code Reader Test Actions', () => {

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

  describe('Webcam controls tests', () => {
    it('gets mediaDevice, decodes and stops right away w/ inner controls', () => {
      cy.window().then(async (win) => {

        const expected = '192.168.1.13:3000';

        const codeReader = new win.ZXingBrowser.BrowserQRCodeReader();

        const videoInputDevices = await win.ZXingBrowser.BrowserCodeReader.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices[0].deviceId;

        console.log(`Started decode from camera with id ${selectedDeviceId}`);

        const previewElem = win.document.querySelector('#test-area-qr-code-webcam > video');
        await codeReader.decodeFromVideoDevice(selectedDeviceId, previewElem, (result, ctrls) => {
          if (!result) return;
          const actual = result.text;
          expect(expected).to.equals(actual);
          ctrls.stop();
        });
      });
    });

    it('gets mediaDevice, decodes and stops right away with outer controls', () => {
      cy.window().then(async (win) => {

        const expected = '192.168.1.13:3000';

        const codeReader = new win.ZXingBrowser.BrowserQRCodeReader();

        const videoInputDevices = await win.ZXingBrowser.BrowserCodeReader.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices[0].deviceId;

        console.log(`Started decode from camera with id ${selectedDeviceId}`);

        const previewElem = win.document.querySelector('#test-area-qr-code-webcam > video');
        const controls = await codeReader.decodeFromVideoDevice(selectedDeviceId, previewElem, result => {
          if (!result) return;
          const actual = result.text;
          expect(actual).to.equals(expected);
          controls.stop();
        });
      });
    });

    it('gets mediaDevice and diretcly stops with outer controls', () => {
      cy.window().then(async (win) => {

        const expected = '192.168.1.13:3000';

        const codeReader = new win.ZXingBrowser.BrowserQRCodeReader();

        const videoInputDevices = await win.ZXingBrowser.BrowserCodeReader.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices[0].deviceId;

        console.log(`Started decode from camera with id ${selectedDeviceId}`);

        const previewElem = win.document.querySelector('#test-area-qr-code-webcam > video');
        const controls = await codeReader.decodeFromVideoDevice(selectedDeviceId, previewElem, result => { });

        setTimeout(() => controls.stop(), 3000);
      });
    });

  });

});
