/// <reference types="cypress" />

context('Aztec Test Actions', () => {



  beforeEach(() => {

    cy.visit('http://localhost:8080/cypress/fixtures//index.html');

    it('has ZXing imported into window', () => {
      cy.window().should('have.property', 'ZXingBrowser');
    });

    it('creates code reader instance', () => {
      const codeReader = new win.ZXingBrowser.BrowserAztecCodeReader();
      expect(codeReader).to.not.be.null;
    });
  });

  describe('Image tests', () => {

    it('decodes blackbox aztec-1/7', () => {
      cy.window().then(async (win) => {

        const expected = 'Code 2D!';

        const codeReader = new win.ZXingBrowser.BrowserAztecCodeReader();

        const source = 'test-area-aztec-image-aztec-1-7';
        const result = await codeReader.decodeFromImageElement(source);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

    it('decodes blackbox aztec-1/lorem-151x151', () => {
      cy.window().then(async (win) => {

        const expected = 'In ut magna vel mauris malesuada dictum. Nulla ullamcorper metus quis diam cursus facilisis. Sed mollis quam id justo rutrum sagittis. Donec laoreet rutrum est, nec convallis mauris condimentum sit amet. Phasellus gravida, justo et congue auctor, nisi ipsum viverra erat, eget hendrerit felis turpis nec lorem. Nulla ultrices, elit pellentesque aliquet laoreet, justo erat pulvinar nisi, id elementum sapien dolor et diam. Donec ac nunc sodales elit placerat eleifend. Sed ornare luctus ornare. Vestibulum vehicula, massa at pharetra fringilla, risus justo faucibus erat, nec porttitor nibh tellus sed est. Ut justo diam, lobortis eu tristique ac, p.In ut magna vel mauris malesuada dictum. Nulla ullamcorper metus quis diam cursus facilisis. Sed mollis quam id justo rutrum sagittis. Donec laoreet rutrum est, nec convallis mauris condimentum sit amet. Phasellus gravida, justo et congue auctor, nisi ipsum viverra erat, eget hendrerit felis turpis nec lorem. Nulla ultrices, elit pellentesque aliquet laoreet, justo erat pulvinar nisi, id elementum sapien dolor et diam. Donec ac nunc sodales elit placerat eleifend. Sed ornare luctus ornare. Vestibulum vehicula, massa at pharetra fringilla, risus justo faucibus erat, nec porttitor nibh tellus sed est. Ut justo diam, lobortis eu tristique ac, p. In ut magna vel mauris malesuada dictum. Nulla ullamcorper metus quis diam cursus facilisis. Sed mollis quam id justo rutrum sagittis. Donec laoreet rutrum est, nec convallis mauris condimentum sit amet. Phasellus gravida, justo et congue auctor, nisi ipsum viverra erat, eget hendrerit felis turpis nec lorem. Nulla ultrices, elit pellentesque aliquet laoreet, justo erat pulvinar nisi, id elementum sapien dolor et diam. Donec ac nunc sodales elit placerat eleifend. Sed ornare luctus ornare. Vestibulum vehicula, massa at pharetra fringilla, risus justo faucibus erat, nec porttitor nibh tellus sed est. Ut justo diam, lobortis eu tristique ac, p.In ut magna vel mauris malesuada dictum. Nulla ullamcorper metus quis diam cursus facilisis. Sed mollis quam id justo rutrum sagittis. Donec laoreet rutrum est, nec convallis mauris condimentum sit amet. Phasellus gravida, justo et congue auctor, nisi ipsum viverra erat, eget hendrerit felis turpis nec lorem. Nulla ultrices, elit pellentesque aliquet laoreet, justo erat pulvinar nisi, id elementum sapien dolor et diam. Donec ac nunc sodales elit placerat eleifend. Sed ornare luctus ornare. Vestibulum vehicula, massa at pharetra fringilla, risus justo faucibus erat, nec porttitor nibh tellus sed est. Ut justo diam, lobortis eu tris. In ut magna vel mauris malesuada dictum. Nulla ullamcorper metus quis diam cursus facilisis. Sed mollis quam id justo rutrum sagittis. Donec laoreet rutrum est, nec convallis mauris condimentum sit amet. Phasellus gravida, justo et congue auctor, nisi ipsum viverra erat, eget hendrerit felis turpis nec lorem.';

        const codeReader = new win.ZXingBrowser.BrowserAztecCodeReader();

        const source = 'test-area-aztec-image-aztec-1-lorem-151x151';
        const result = await codeReader.decodeFromImageElement(source);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

    it('decodes blackbox aztec-1/lorem-151x151 via URL', () => {
      cy.window().then(async (win) => {

        const expected = 'In ut magna vel mauris malesuada dictum. Nulla ullamcorper metus quis diam cursus facilisis. Sed mollis quam id justo rutrum sagittis. Donec laoreet rutrum est, nec convallis mauris condimentum sit amet. Phasellus gravida, justo et congue auctor, nisi ipsum viverra erat, eget hendrerit felis turpis nec lorem. Nulla ultrices, elit pellentesque aliquet laoreet, justo erat pulvinar nisi, id elementum sapien dolor et diam. Donec ac nunc sodales elit placerat eleifend. Sed ornare luctus ornare. Vestibulum vehicula, massa at pharetra fringilla, risus justo faucibus erat, nec porttitor nibh tellus sed est. Ut justo diam, lobortis eu tristique ac, p.In ut magna vel mauris malesuada dictum. Nulla ullamcorper metus quis diam cursus facilisis. Sed mollis quam id justo rutrum sagittis. Donec laoreet rutrum est, nec convallis mauris condimentum sit amet. Phasellus gravida, justo et congue auctor, nisi ipsum viverra erat, eget hendrerit felis turpis nec lorem. Nulla ultrices, elit pellentesque aliquet laoreet, justo erat pulvinar nisi, id elementum sapien dolor et diam. Donec ac nunc sodales elit placerat eleifend. Sed ornare luctus ornare. Vestibulum vehicula, massa at pharetra fringilla, risus justo faucibus erat, nec porttitor nibh tellus sed est. Ut justo diam, lobortis eu tristique ac, p. In ut magna vel mauris malesuada dictum. Nulla ullamcorper metus quis diam cursus facilisis. Sed mollis quam id justo rutrum sagittis. Donec laoreet rutrum est, nec convallis mauris condimentum sit amet. Phasellus gravida, justo et congue auctor, nisi ipsum viverra erat, eget hendrerit felis turpis nec lorem. Nulla ultrices, elit pellentesque aliquet laoreet, justo erat pulvinar nisi, id elementum sapien dolor et diam. Donec ac nunc sodales elit placerat eleifend. Sed ornare luctus ornare. Vestibulum vehicula, massa at pharetra fringilla, risus justo faucibus erat, nec porttitor nibh tellus sed est. Ut justo diam, lobortis eu tristique ac, p.In ut magna vel mauris malesuada dictum. Nulla ullamcorper metus quis diam cursus facilisis. Sed mollis quam id justo rutrum sagittis. Donec laoreet rutrum est, nec convallis mauris condimentum sit amet. Phasellus gravida, justo et congue auctor, nisi ipsum viverra erat, eget hendrerit felis turpis nec lorem. Nulla ultrices, elit pellentesque aliquet laoreet, justo erat pulvinar nisi, id elementum sapien dolor et diam. Donec ac nunc sodales elit placerat eleifend. Sed ornare luctus ornare. Vestibulum vehicula, massa at pharetra fringilla, risus justo faucibus erat, nec porttitor nibh tellus sed est. Ut justo diam, lobortis eu tris. In ut magna vel mauris malesuada dictum. Nulla ullamcorper metus quis diam cursus facilisis. Sed mollis quam id justo rutrum sagittis. Donec laoreet rutrum est, nec convallis mauris condimentum sit amet. Phasellus gravida, justo et congue auctor, nisi ipsum viverra erat, eget hendrerit felis turpis nec lorem.';

        const codeReader = new win.ZXingBrowser.BrowserAztecCodeReader();

        const source = 'http://localhost:8080/cypress/fixtures/images/blackbox/aztec-1/lorem-151x151.png';
        const result = await codeReader.decodeFromImageUrl(source);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

    it('decodes blackbox aztec-2/01', () => {
      cy.window().then(async (win) => {

        const expected = 'This is a real world Aztec barcode test.';

        const codeReader = new win.ZXingBrowser.BrowserAztecCodeReader();

        const source = 'test-area-aztec-image-aztec-2-01';
        const result = await codeReader.decodeFromImageElement(source);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

    it.skip('decodes blackbox aztec-2/22', () => {
      // THIS TEST IS TIMING OUT!!
      cy.window().then(async (win) => {

        const expected = 'http://code.google.com/p/zxing/source/browse/trunk/android/src/com/google/zxing/client/android/result/URIResultHandler.java';

        const codeReader = new win.ZXingBrowser.BrowserAztecCodeReader();

        const source = 'test-area-aztec-image-aztec-2-22';
        const result = await codeReader.decodeFromImageElement(source);

        const actual = result.text;

        expect(actual).to.equals(expected);
      });
    });

  });

});
