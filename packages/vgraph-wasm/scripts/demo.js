/**
 * 启动 demo：若默认端口被占用则自动尝试端口 +1，直到找到可用端口
 */
const net = require('net');
const { spawn } = require('child_process');
const path = require('path');

const DEFAULT_PORT = 9001;
const MAX_ATTEMPTS = 50;

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '0.0.0.0');
  });
}

async function findAvailablePort(startPort) {
  for (let p = startPort; p < startPort + MAX_ATTEMPTS; p++) {
    if (await isPortAvailable(p)) {
      return p;
    }
  }
  throw new Error(`未在 ${startPort}～${startPort + MAX_ATTEMPTS - 1} 范围内找到可用端口`);
}

async function main() {
  const port = await findAvailablePort(DEFAULT_PORT);
  if (port !== DEFAULT_PORT) {
    console.log(`端口 ${DEFAULT_PORT} 已被占用，使用端口 ${port}`);
  }

  const cwd = path.resolve(__dirname, '..');
  const child = spawn(
    'npx',
    [
      'webpack-dev-server',
      '--config', 'webpack.config.js',
      '--open',
      '--hot',
      '--port', String(port),
    ],
    {
      cwd,
      stdio: 'inherit',
      shell: true,
    }
  );

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
