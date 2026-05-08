const { spawn } = require('child_process');
const path = require('path');

delete process.env.ELECTRON_RUN_AS_NODE;

const electron = path.join(
  __dirname, '..', 'node_modules', '.bin',
  process.platform === 'win32' ? 'electron.cmd' : 'electron'
);

const child = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: process.env,
  cwd: path.join(__dirname, '..'),
  shell: true,
});

child.on('close', (code) => process.exit(code));
