import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isAbsoluteCryonPath, resolveCryonPathRoot, sanitizeCryonPathRoot } from './pathUtils';

describe('resolveCryonPathRoot', () => {
  it('rejects empty and relative values', () => {
    expect(resolveCryonPathRoot(undefined)).toBeUndefined();
    expect(resolveCryonPathRoot('   ')).toBeUndefined();
    expect(resolveCryonPathRoot('relative/root')).toBeUndefined();
  });

  it('retains absolute paths without requiring them to exist', () => {
    const absolute = path.resolve('nonexistent-cryon-root');
    expect(resolveCryonPathRoot(`  ${absolute}  `)).toBe(absolute);
  });

  it('expands a home-relative root before validation', () => {
    expect(resolveCryonPathRoot('~')).toBe(os.homedir());
  });

  it('removes a rejected value from the child-process environment', () => {
    const env = { CRYON_PATH_ROOT: 'relative/root' };
    expect(sanitizeCryonPathRoot(env)).toBeUndefined();
    expect(env).not.toHaveProperty('CRYON_PATH_ROOT');
  });

  it('matches Rust absolute-path handling on Windows', () => {
    expect(isAbsoluteCryonPath('C:\\cryon\\root', 'win32')).toBe(true);
    expect(isAbsoluteCryonPath('\\\\server\\share\\cryon', 'win32')).toBe(true);
    expect(isAbsoluteCryonPath('C:cryon\\root', 'win32')).toBe(false);
    expect(isAbsoluteCryonPath('\\cryon\\root', 'win32')).toBe(false);
    expect(isAbsoluteCryonPath('/cryon/root', 'win32')).toBe(false);
  });
});
