// cli/flow.mjs
// Responsibility: command line for preflight and deterministic runs of the shared solver.
import { readFileSync } from 'node:fs';

const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const help = `Usage: node cli/flow.mjs <command>

Commands:
  preflight   Check Node and Chrome (not implemented yet: see #2)
  run <case>  Run a case (not implemented yet: see #3)

Options:
  --help      Show this help
  --version   Show the version
`;
const parents = { preflight: 2, run: 3 };
const arg = process.argv[2];

if (arg === '--help' || arg === '-h') {
  process.stdout.write(help);
} else if (arg === '--version') {
  process.stdout.write(`${version}\n`);
} else if (Object.hasOwn(parents, arg)) {
  process.stderr.write(`not implemented yet: see #${parents[arg]}\n`);
  process.exitCode = 1;
} else {
  process.stderr.write(help);
  process.exitCode = arg === undefined ? 0 : 2;
}
