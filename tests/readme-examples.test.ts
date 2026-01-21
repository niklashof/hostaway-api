import { describe, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tscExecutable = resolve(
  rootDir,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsc.cmd' : 'tsc'
);

describe('README examples', () => {
  it('typecheck against public types', () => {
    try {
      execFileSync(tscExecutable, ['-p', 'tests/tsconfig.readme.json'], {
        cwd: rootDir,
        stdio: 'pipe',
      });
    } catch (error) {
      const detail = error as { stdout?: Buffer; stderr?: Buffer };
      const output = `${detail.stdout?.toString() ?? ''}${detail.stderr?.toString() ?? ''}`;
      throw new Error(`README examples failed to typecheck.\n${output}`.trim());
    }
  });
});
