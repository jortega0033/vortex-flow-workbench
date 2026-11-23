// server/serve.mjs
// Responsibility: loopback static server for app/ and solver/ only.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8' };
const help = `Usage: node server/serve.mjs [--port <n>]

Serves app/ at / and solver/ at /solver/ on http://127.0.0.1:8791.
  --port <n>  Listen on another port (0 picks a free one)
  --help      Show this help
  --version   Show the version
`;

// Map a request target to a file under the allowlist, or null.
export function resolveTarget(target) {
  let path;
  try {
    path = decodeURIComponent(target.split(/[?#]/)[0]);
  } catch {
    return null;
  }
  if (!path.startsWith('/') || path.startsWith('//') || /[\0\\]/.test(path)) return null;
  if (path.split('/').includes('..')) return null;
  if (path === '/') path = '/index.html';
  const solver = path.startsWith('/solver/');
  const dir = join(root, solver ? 'solver' : 'app');
  const file = normalize(join(dir, solver ? path.slice(8) : path));
  if (!file.startsWith(dir + sep) || !Object.hasOwn(types, extname(file))) return null;
  return file;
}

export function createApp() {
  return createServer(async (req, res) => {
    const send = (code, headers = {}, body = '') => {
      res.writeHead(code, { 'x-content-type-options': 'nosniff', ...headers });
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, { allow: 'GET, HEAD' }, 'Method not allowed\n');
      const file = resolveTarget(req.url ?? '');
      if (!file) return send(404, {}, 'Not found\n');
      const body = await readFile(file);
      send(200, { 'content-type': types[extname(file)], 'content-length': body.length }, body);
    } catch {
      send(404, {}, 'Not found\n');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    process.stdout.write(help);
  } else if (args.includes('--version')) {
    process.stdout.write(`${version}\n`);
  } else {
    const i = args.indexOf('--port');
    const port = i < 0 ? 8791 : Number(args[i + 1]);
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
      process.stderr.write('invalid --port\n');
      process.exit(2);
    }
    const server = createApp();
    server.on('error', (err) => {
      process.stderr.write(`cannot listen on 127.0.0.1:${port}: ${err.code ?? err.message}\n`);
      process.exit(1);
    });
    server.listen(port, '127.0.0.1', () => {
      process.stdout.write(`listening on http://127.0.0.1:${server.address().port}\n`);
    });
  }
}
