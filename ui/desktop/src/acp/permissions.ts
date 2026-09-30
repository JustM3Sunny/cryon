import type { ToolListItem, ToolPermissionEntry, ToolPermissionLevel } from '@aaif/cryon-acp-client';
import { getAcpClient } from './acpConnection';

export type { ToolListItem, ToolPermissionEntry, ToolPermissionLevel };

export async function listTools(sessionId: string, extensionName?: string): Promise<ToolListItem[]> {
  const client = await getAcpClient();
  const response = await client.cryon.toolsList_unstable({
    sessionId,
    extensionName: extensionName ?? null,
  });
  return response.tools ?? [];
}

export async function setToolPermissions(toolPermissions: ToolPermissionEntry[]): Promise<void> {
  const client = await getAcpClient();
  await client.cryon.toolsPermissionsSet_unstable({ toolPermissions });
}
