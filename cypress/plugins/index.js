/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      // Mac/Linux
      launchOptions.args.push('--use-file-for-fake-video-capture=cypress/fixtures/qrcode-video.mjpeg');

      // Windows
      // launchOptions.args.push('--use-file-for-fake-video-capture=cypress\\fixtures\\qrcode-video.mp4');

      // generate Y4M file
      // https://testrtc.com/y4m-video-chrome/
    }

    // this should allow you to debug while testing
    // if (browser.name === 'chrome') {
    //   launchOptions.args.push('--remote-debugging-port=9222');
    // }

    return launchOptions;
  });
};
