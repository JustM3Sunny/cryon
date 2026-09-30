import type {
  GetPromptResponse_unstable,
  PromptTemplateEntry,
} from '@aaif/cryon-acp-client';
import { getAcpClient } from './acpConnection';

export type PromptTemplate = PromptTemplateEntry;
export type PromptContent = GetPromptResponse_unstable;

export async function acpListPrompts(): Promise<PromptTemplate[]> {
  const client = await getAcpClient();
  const response = await client.cryon.configPromptsList_unstable({});
  return response.prompts;
}

export async function acpGetPrompt(name: string): Promise<PromptContent> {
  const client = await getAcpClient();
  return client.cryon.configPromptsGet_unstable({ name });
}

export async function acpSavePrompt(name: string, content: string): Promise<void> {
  const client = await getAcpClient();
  await client.cryon.configPromptsSave_unstable({ name, content });
}

export async function acpResetPrompt(name: string): Promise<void> {
  const client = await getAcpClient();
  await client.cryon.configPromptsReset_unstable({ name });
}
