import type { ToolCall, ToolCallUpdate } from '@agentclientprotocol/sdk';
import type { TokenState } from '../../types/chat';
import type { Message, NotificationEvent } from '../../types/message';

export type AcpChatStateChange =
  | { type: 'messages'; messages: Message[] }
  | { type: 'tokenState'; tokenState: Partial<TokenState> }
  | { type: 'progressMessage'; message: string | undefined }
  | {
      type: 'sessionInfo';
      name?: string;
      activeRunId?: string | null;
      cryonMode?: string;
    }
  | { type: 'localSteerConfirmed'; messageId: string }
  | { type: 'notification'; notification: NotificationEvent };

export interface AdapterState {
  messages: Message[];
  localSteerTextByMessageId: Map<string, string>;
  toolCallStatesById: Map<string, ToolCallState>;
}

export type ToolCallState = Omit<ToolCallUpdate, '_meta'>;

export interface CryonMessageMeta {
  messageId?: string;
  created?: number;
  outputTokenLimitReached?: boolean;
  fallbackContent?: boolean;
  steer?: boolean;
}

export interface ToolIdentity {
  toolName?: string;
  extensionName?: string;
}

export const DEFAULT_VISIBLE_MESSAGE_METADATA: Message['metadata'] = {
  userVisible: true,
  agentVisible: true,
};

export function messagesChange(state: AdapterState): AcpChatStateChange[] {
  // Pass the live array by reference: the store is the only consumer and it
  // clones on write (applyChatStateChanges). Cloning here as well made every
  // streamed chunk O(messages) twice, which turns session-load replay into
  // O(n^2) on large sessions.
  return [{ type: 'messages', messages: state.messages }];
}

export function cloneMessage(message: Message): Message {
  return {
    ...message,
    content: message.content.map((content) => ({ ...content })),
    metadata: { ...message.metadata },
  };
}

export function getCryonMessageMeta(update: { _meta?: unknown }): CryonMessageMeta {
  if (!isRecord(update._meta)) {
    return {};
  }

  const cryon = update._meta.cryon;
  if (!isRecord(cryon)) {
    return {};
  }

  const outputTokenLimitReached = cryon.outputTokenLimitReached === true;

  return {
    created: typeof cryon.created === 'number' ? cryon.created : undefined,
    messageId: typeof cryon.messageId === 'string' ? cryon.messageId : undefined,
    outputTokenLimitReached: outputTokenLimitReached ? true : undefined,
    fallbackContent: cryon.fallbackContent === true ? true : undefined,
    steer: cryon.steer === true ? true : undefined,
  };
}

export function getCryonActiveRunId(update: { _meta?: unknown }): string | null | undefined {
  if (!isRecord(update._meta)) {
    return undefined;
  }

  const cryon = update._meta.cryon;
  if (!isRecord(cryon) || !('activeRunId' in cryon)) {
    return undefined;
  }

  return typeof cryon.activeRunId === 'string' || cryon.activeRunId === null
    ? cryon.activeRunId
    : undefined;
}

export function getCryonQueuedSteer(update: { _meta?: unknown }): string | undefined {
  if (!isRecord(update._meta)) return undefined;
  const cryon = update._meta.cryon;
  if (!isRecord(cryon) || !isRecord(cryon.queuedSteer)) return undefined;
  return typeof cryon.queuedSteer.messageId === 'string' ? cryon.queuedSteer.messageId : undefined;
}

export function rawInputToArguments(rawInput: unknown): Record<string, unknown> {
  return isRecord(rawInput) ? rawInput : {};
}

export function toolIdentity(update: ToolCall | ToolCallUpdate): ToolIdentity {
  if (!isRecord(update._meta)) {
    return {};
  }

  const cryon = update._meta.cryon;
  if (!isRecord(cryon) || !isRecord(cryon.toolCall)) {
    return {};
  }

  return {
    toolName: typeof cryon.toolCall.toolName === 'string' ? cryon.toolCall.toolName : undefined,
    extensionName:
      typeof cryon.toolCall.extensionName === 'string' ? cryon.toolCall.extensionName : undefined,
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
