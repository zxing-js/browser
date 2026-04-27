import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'dist/es2015/index.js',
  plugins: [
    resolve(),
  ],
  // Tell Rollup that top-level `this` is `window` (required for TypeScript
  // __awaiter/__extends helpers compiled to ES5 targeting a browser UMD bundle).
  context: 'window',
  onwarn(warning, warn) {
    warn(warning);
  },
  output: {
    format: 'umd',
    name: 'ZXingBrowser',
    sourcemap: true,
    file: 'dist/umd/zxing-browser.js'
  },
};
