/// <reference types="cypress" />

context('PDF417 Tets Actions', () => {

  beforeEach(() => {

    cy.visit('http://localhost:8080/cypress/fixtures//index.html');

    it('has ZXing imported into window', () => {
      cy.window().should('have.property', 'ZXingBrowser');
    });

    it('creates code reader instance', () => {
      const codeReader = new win.ZXingBrowser.BrowserPDF417Reader();
      expect(codeReader).to.not.be.null;
    });
  });

  describe('Image tests', () => {

    it('decodes blackbox pdf417-2/05', () => {
      cy.window().then(async (win) => {

        const expected = '1234567890';

        const codeReader = new win.ZXingBrowser.BrowserPDF417Reader();

        const source = 'test-area-pdf417-image-pdf417-2-05';
        const result = await codeReader.decodeFromImageElement(source);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

    it('decodes blackbox pdf417-2/15', () => {
      cy.window().then(async (win) => {

        const expected = 'A PDF 417 barcode with ASCII text';

        const codeReader = new win.ZXingBrowser.BrowserPDF417Reader();

        const source = 'test-area-pdf417-image-pdf417-2-15';
        const result = await codeReader.decodeFromImageElement(source);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

    it('decodes blackbox pdf417-3/08', () => {
      cy.window().then(async (win) => {

        const expected = 'A larger PDF417 barcode with text and error correction level 4.';

        const codeReader = new win.ZXingBrowser.BrowserPDF417Reader();

        const source = 'test-area-pdf417-image-pdf417-3-08';
        const result = await codeReader.decodeFromImageElement(source);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

    it('decodes blackbox pdf417-3/08 via URL', () => {
      cy.window().then(async (win) => {

        const expected = 'A larger PDF417 barcode with text and error correction level 4.';

        const codeReader = new win.ZXingBrowser.BrowserPDF417Reader();

        const source = 'http://localhost:8080/cypress/fixtures//images/blackbox/pdf417-3/08.png';
        const result = await codeReader.decodeFromImageUrl(source);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

  });

});
