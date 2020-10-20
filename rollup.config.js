export default {
  input: 'dist/esm/index.js',
  external: [
    '@zxing/library',
  ],
  output: {
    format: 'umd',
    name: 'ZXingBrowser',
    sourcemap: true,
    file: 'dist/umd/zxing-browser.js',
    globals: {
      '@zxing/library': 'ZXingLibrary',
    },
  },
};
