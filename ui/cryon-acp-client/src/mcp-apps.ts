import { RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/app-bridge";
import type {
  McpUiAppResourceConfig,
  McpUiAppToolConfig,
} from "@modelcontextprotocol/ext-apps/server";
import type {
  BlobResourceContents,
  ReadResourceResult,
  TextResourceContents,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

export const CRYON_MCP_UI_EXTENSION_ID = "io.modelcontextprotocol/ui" as const;

export interface CryonMcpUiExtensionSettings {
  mimeTypes: string[];
}

export interface CryonMcpHostCapabilities {
  extensions: Record<string, CryonMcpUiExtensionSettings>;
}

export type CryonToolUiMetadata = Extract<
  McpUiAppToolConfig["_meta"],
  { ui: unknown }
>["ui"];

export type CryonToolMetadata = NonNullable<Tool["_meta"]> & {
  ui?: CryonToolUiMetadata;
  cryon_extension?: string;
};

export type CryonSessionTool = Tool & {
  meta?: CryonToolMetadata;
  _meta?: CryonToolMetadata;
};

export type CryonTextResourceContents = TextResourceContents;

export type CryonBlobResourceContents = BlobResourceContents;

export type CryonResourceContents = TextResourceContents | BlobResourceContents;

export type CryonReadResourceResult = ReadResourceResult;

export type CryonResourceMetadata = NonNullable<
  Extract<NonNullable<McpUiAppResourceConfig["_meta"]>, { ui?: unknown }>["ui"]
>;

export interface CryonMcpAppToolPayload {
  toolName: string;
  extensionName: string;
  resourceUri: string;
  toolMeta?: CryonToolMetadata;
  resourceResult?: CryonReadResourceResult | null;
  readError?: string;
}

export interface CryonToolCallUpdateMeta {
  cryon?: {
    mcpApp?: CryonMcpAppToolPayload;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export const DEFAULT_CRYON_MCP_HOST_CAPABILITIES: CryonMcpHostCapabilities = {
  extensions: {
    [CRYON_MCP_UI_EXTENSION_ID]: {
      mimeTypes: [RESOURCE_MIME_TYPE],
    },
  },
};
