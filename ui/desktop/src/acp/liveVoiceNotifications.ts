import type { CryonSessionNotification_unstable } from '@aaif/cryon-acp-client';

export type LiveVoiceInteractionEndedNotification = {
  sessionId: string;
  update: Extract<
    CryonSessionNotification_unstable['update'],
    { sessionUpdate: 'live_voice_interaction_ended' }
  >;
};

type LiveVoiceInteractionEndedListener = (
  notification: LiveVoiceInteractionEndedNotification
) => void;

const listeners = new Set<LiveVoiceInteractionEndedListener>();

export function subscribeToLiveVoiceInteractionEnded(
  listener: LiveVoiceInteractionEndedListener
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishLiveVoiceInteractionEnded(
  notification: LiveVoiceInteractionEndedNotification
): void {
  for (const listener of listeners) {
    listener(notification);
  }
}
