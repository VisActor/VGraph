/**
 * @type {Partial<import('@internal/bundler').Config>}
 */
module.exports = {
  formats: ['cjs', 'es', 'umd'],
  noEmitOnError: false,
  copy: ['css'],
  name: '{{projectName}}',
  umdOutputFilename: '{{projectName}}',
  rollupOptions: {
    treeshake: true
  }
};
