import react from '@vitejs/plugin-react';
import * as path from 'path';
import pkg from '../packages/vgraph/package.json';

export default {
  server: {
    host: '0.0.0.0',
    port: 3020,
    open: true
  },
  define: {
    __DEV__: true,
    __VERSION__: JSON.stringify(pkg.version)
  },
  resolve: {
    alias: {
      '@visactor/vgraph': path.resolve(__dirname, '../packages/vgraph/src/index.ts'),
      '@visactor/react-vgraph': path.resolve(__dirname, '../packages/react-vgraph/src/index.ts'),
      '@visactor/react-vgraph-ui': path.resolve(__dirname, '../packages/react-vgraph-ui/src/index.ts')
    }
  },
  plugins: [react()]
};
