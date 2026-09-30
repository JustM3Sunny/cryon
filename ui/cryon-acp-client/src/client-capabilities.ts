import type { CryonMcpHostCapabilities } from "./mcp-apps.js";

export interface CryonClientCapabilitiesMeta {
  cryon?: {
    mcpHostCapabilities?: CryonMcpHostCapabilities;
    customNotifications?: boolean;
  };
}
