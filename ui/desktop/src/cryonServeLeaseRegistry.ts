import type { CryonServeExitSignal, CryonServeResult, Logger } from './cryonServe';

export const CRYON_SERVE_EXITED_USER_MESSAGE =
  "This window's Cryon backend stopped. Close this window and open a new chat to start a new backend. If this keeps happening, restart Cryon Desktop.";

export interface CryonServeLease {
  acpUrl: string;
  secretKey: string;
  cleanup: () => Promise<void>;
  windowIds: Set<number>;
  cleanedUp: boolean;
  exited: boolean;
  exitCode: number | null;
  exitSignal: CryonServeExitSignal;
}

export class CryonServeLeaseRegistry {
  private leasesByWindowId = new Map<number, CryonServeLease>();

  constructor(private readonly logger: Logger) {}

  create(result: CryonServeResult, secretKey: string): CryonServeLease {
    const lease: CryonServeLease = {
      acpUrl: result.acpUrl,
      secretKey,
      cleanup: result.cleanup,
      windowIds: new Set<number>(),
      cleanedUp: false,
      exited: false,
      exitCode: null,
      exitSignal: null,
    };

    const markExited = ({
      code,
      signal,
      logUnexpected,
    }: {
      code?: number | null;
      signal?: CryonServeExitSignal;
      logUnexpected: boolean;
    }) => {
      const firstExit = !lease.exited;
      lease.exited = true;
      if (code !== undefined) {
        lease.exitCode = code;
      }
      if (signal !== undefined) {
        lease.exitSignal = signal;
      }

      if (logUnexpected && firstExit && !lease.cleanedUp) {
        this.logger.error('Cryon ACP server exited unexpectedly', {
          code: lease.exitCode,
          signal: lease.exitSignal,
          windowIds: [...lease.windowIds],
        });
      }
    };

    result.process.once('exit', (code, signal) => {
      markExited({ code, signal, logUnexpected: true });
    });

    if (result.hasExited()) {
      const exitDetails = result.getExitDetails();
      markExited({ code: exitDetails.code, signal: exitDetails.signal, logUnexpected: false });
    }

    return lease;
  }

  createExternal(
    acpUrl: string,
    secretKey: string,
    cleanup: () => Promise<void> = async () => undefined
  ): CryonServeLease {
    return {
      acpUrl,
      secretKey,
      cleanup,
      windowIds: new Set<number>(),
      cleanedUp: false,
      exited: false,
      exitCode: null,
      exitSignal: null,
    };
  }

  get(windowId: number): CryonServeLease | null {
    return this.leasesByWindowId.get(windowId) ?? null;
  }

  getAcpUrl(windowId: number): string | null {
    const lease = this.get(windowId);
    if (!lease) {
      return null;
    }
    if (lease.exited) {
      throw new Error(CRYON_SERVE_EXITED_USER_MESSAGE);
    }
    return lease.acpUrl;
  }

  getSecretKey(windowId: number): string | null {
    const lease = this.get(windowId);
    if (!lease) {
      return null;
    }
    if (lease.exited) {
      throw new Error(CRYON_SERVE_EXITED_USER_MESSAGE);
    }
    return lease.secretKey;
  }

  attachWindow(windowId: number, lease: CryonServeLease) {
    lease.windowIds.add(windowId);
    this.leasesByWindowId.set(windowId, lease);
  }

  async releaseWindow(windowId: number) {
    const lease = this.leasesByWindowId.get(windowId);
    this.leasesByWindowId.delete(windowId);

    if (!lease) {
      return;
    }

    lease.windowIds.delete(windowId);
    if (lease.windowIds.size === 0) {
      await this.cleanupLease(lease);
    }
  }

  async cleanupLease(lease: CryonServeLease) {
    if (lease.cleanedUp) {
      return;
    }

    lease.cleanedUp = true;
    for (const windowId of lease.windowIds) {
      this.leasesByWindowId.delete(windowId);
    }
    lease.windowIds.clear();

    try {
      await lease.cleanup();
    } catch (error) {
      this.logger.error('Failed to cleanup cryon serve backend:', error);
    }
  }

  activeLeaseCount(): number {
    return this.uniqueLeases().length;
  }

  async cleanupAll() {
    await Promise.all(this.uniqueLeases().map((lease) => this.cleanupLease(lease)));
  }

  private uniqueLeases(): CryonServeLease[] {
    return [...new Set(this.leasesByWindowId.values())];
  }
}
