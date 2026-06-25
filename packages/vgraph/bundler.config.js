/**
 * @type {Partial<import('@internal/bundler').Config>}
 */
module.exports = {
  formats: ['cjs', 'es', 'umd'],
  noEmitOnError: false,
  name: 'VGraph',
  umdOutputFilename: 'vgraph',
  rollupOptions: {
    treeshake: true
  }
};
