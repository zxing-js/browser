import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'dist/es2015/index.js',
  plugins: [
    resolve(),
  ],
  context: '(global || self || globalThis || window || undefined)',
  output: {
    format: 'umd',
    name: 'ZXingBrowser',
    sourcemap: true,
    file: 'dist/umd/zxing-browser.js'
  },
};
