/// <reference types="cypress" />

context('Actions', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/cypress/fixtures//index.html');
  });

  describe('Instantiates Multi Format One Dimension Reader', () => {
    it('has ZXing imported into window', () => {
      cy.window().should('have.property', 'ZXingBrowser');
    });
    it('creates instace', () => {
      cy.window().then((win) => {
        // call whatever you want on your app's window
        // so your app methods must be exposed somehow
        const codeReader = new win.ZXingBrowser.BrowserMultiFormatOneDReader();
        expect(codeReader).to.not.be.null;
      });
    });
  });

});
