import { EventEmitter } from 'node:events';
import { describe, expect, it, vi } from 'vitest';
import type { CryonServeResult, Logger } from './cryonServe';
import {
  CRYON_SERVE_EXITED_USER_MESSAGE,
  CryonServeLeaseRegistry,
} from './cryonServeLeaseRegistry';

function createLogger(): Logger {
  return {
    info: vi.fn(),
    error: vi.fn(),
  };
}

function createCryonServeResult(
  overrides: Partial<Pick<CryonServeResult, 'cleanup' | 'hasExited' | 'getExitDetails'>> = {}
): CryonServeResult {
  return {
    acpUrl: 'ws://127.0.0.1:1234/acp?token=test',
    workingDir: '/tmp',
    process: new EventEmitter() as CryonServeResult['process'],
    errorLog: [],
    certFingerprint: null,
    cleanup: vi.fn(async () => undefined),
    hasExited: () => false,
    getExitDetails: () => ({ code: null, signal: null }),
    startupDiagnosticsPath: null,
    getStartupDiagnostics: () => null,
    recordStartupEvent: () => undefined,
    ...overrides,
  };
}

describe('CryonServeLeaseRegistry', () => {
  it('returns the ACP URL for an attached live lease', () => {
    const store = new CryonServeLeaseRegistry(createLogger());
    const lease = store.create(createCryonServeResult(), 'local-secret');

    store.attachWindow(1, lease);

    expect(store.getAcpUrl(1)).toBe('ws://127.0.0.1:1234/acp?token=test');
    expect(store.getSecretKey(1)).toBe('local-secret');
  });

  it('throws a recovery message after the process exits', () => {
    const logger = createLogger();
    const store = new CryonServeLeaseRegistry(logger);
    const result = createCryonServeResult();
    const lease = store.create(result, 'local-secret');
    store.attachWindow(1, lease);

    result.process.emit('exit', 1, null);

    expect(() => store.getAcpUrl(1)).toThrow(CRYON_SERVE_EXITED_USER_MESSAGE);
    expect(() => store.getSecretKey(1)).toThrow(CRYON_SERVE_EXITED_USER_MESSAGE);
    expect(logger.error).toHaveBeenCalledWith(
      'Cryon ACP server exited unexpectedly',
      expect.objectContaining({ code: 1, signal: null, windowIds: [1] })
    );
  });

  it('uses the current child exit state when creating the lease', () => {
    const store = new CryonServeLeaseRegistry(createLogger());
    const lease = store.create(
      createCryonServeResult({
        hasExited: () => true,
        getExitDetails: () => ({ code: null, signal: 'SIGTERM' }),
      }),
      'local-secret'
    );

    store.attachWindow(1, lease);

    expect(() => store.getAcpUrl(1)).toThrow(CRYON_SERVE_EXITED_USER_MESSAGE);
  });

  it('cleans up once after the last attached window is released', async () => {
    const cleanup = vi.fn(async () => undefined);
    const store = new CryonServeLeaseRegistry(createLogger());
    const lease = store.create(createCryonServeResult({ cleanup }), 'local-secret');
    store.attachWindow(1, lease);
    store.attachWindow(2, lease);

    await store.releaseWindow(1);
    expect(cleanup).not.toHaveBeenCalled();
    expect(store.getAcpUrl(2)).toBe('ws://127.0.0.1:1234/acp?token=test');
    expect(store.getSecretKey(2)).toBe('local-secret');

    await store.releaseWindow(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(store.getAcpUrl(2)).toBeNull();
    expect(store.getSecretKey(2)).toBeNull();
  });

  it('creates an external ACP lease without process cleanup', async () => {
    const store = new CryonServeLeaseRegistry(createLogger());
    const lease = store.createExternal('wss://example.com/cryon/acp?token=test', 'external-secret');

    store.attachWindow(1, lease);

    expect(store.getAcpUrl(1)).toBe('wss://example.com/cryon/acp?token=test');
    expect(store.getSecretKey(1)).toBe('external-secret');

    await store.releaseWindow(1);
    expect(store.getAcpUrl(1)).toBeNull();
    expect(store.getSecretKey(1)).toBeNull();
  });

  it('cleans up external leases after the last attached window is released', async () => {
    const cleanup = vi.fn(async () => undefined);
    const store = new CryonServeLeaseRegistry(createLogger());
    const lease = store.createExternal(
      'wss://example.com/cryon/acp?token=test',
      'external-secret',
      cleanup
    );
    store.attachWindow(1, lease);
    store.attachWindow(2, lease);

    await store.releaseWindow(1);
    expect(cleanup).not.toHaveBeenCalled();

    await store.releaseWindow(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
