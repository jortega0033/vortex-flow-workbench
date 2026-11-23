import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { request } from 'node:http';

const modules = ['cases', 'grid', 'projection', 'step', 'boundaries', 'diagnostics']
  .map((n) => `../solver/${n}.mjs`)
  .concat('../app/worker.mjs', '../server/serve.mjs');

for (const m of modules) {
  test(`imports ${m}`, async () => {
    await import(m);
  });
}

const node = (...args) => spawnSync(process.execPath, args, { encoding: 'utf8' });

test('cli and server help and version', () => {
  for (const file of ['cli/flow.mjs', 'server/serve.mjs']) {
    assert.match(node(file, '--help').stdout, /Usage:/);
    assert.match(node(file, '--version').stdout, /^\d+\.\d+\.\d+/);
  }
});

test('cli stubs exit non-zero', () => {
  for (const [args, issue] of [[['preflight'], 2], [['run', 'cavity'], 3]]) {
    const r = node('cli/flow.mjs', ...args);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, new RegExp(`not implemented yet: see #${issue}`));
  }
});

// Raw path so odd targets such as // reach the server unchanged.
const get = (port, path, method = 'GET') =>
  new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port, path, method }, (res) => {
      res.resume();
      res.on('end', () => resolve(res));
    });
    req.on('error', reject);
    req.end();
  });

test('server serves the shell and refuses paths outside the allowlist', async () => {
  const child = spawn(process.execPath, ['server/serve.mjs', '--port', '0']);
  try {
    const [line] = await once(child.stdout, 'data');
    const port = Number(/:(\d+)/.exec(String(line))[1]);
    assert.equal((await get(port, '/')).statusCode, 200);
    assert.equal((await get(port, '/tokens.css')).statusCode, 200);
    assert.match((await get(port, '/solver/grid.mjs')).headers['content-type'], /text\/javascript/);
    for (const p of ['//', '/../package.json', '/solver/../package.json', '/%2e%2e/package.json', '/package.json', '/%zz']) {
      assert.equal((await get(port, p)).statusCode, 404, p);
    }
    assert.equal((await get(port, '/', 'POST')).statusCode, 405);
    assert.equal((await get(port, '/', 'HEAD')).statusCode, 200);
  } finally {
    child.kill();
  }
});
