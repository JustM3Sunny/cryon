import type {
  LiveVoiceAvailabilityResponse_unstable,
  LiveVoiceStartResponse_unstable,
} from '@aaif/cryon-acp-client';
import { getAcpClient } from './acpConnection';

export async function acpGetLiveVoiceAvailability(
  sessionId?: string
): Promise<LiveVoiceAvailabilityResponse_unstable> {
  const { cryon } = await getAcpClient();
  const useLegacyAgentLoop = await window.electron.getSetting('useLegacyAgentLoop');
  return cryon.sessionLiveVoiceAvailability_unstable({
    ...(sessionId ? { sessionId } : {}),
    _meta: { cryon: { unrolledAgentLoop: !useLegacyAgentLoop } },
  });
}

export async function acpStartLiveVoice(
  sessionId: string,
  offerSdp: string
): Promise<LiveVoiceStartResponse_unstable> {
  const { cryon } = await getAcpClient();
  const useLegacyAgentLoop = await window.electron.getSetting('useLegacyAgentLoop');
  return cryon.sessionLiveVoiceStart_unstable({
    sessionId,
    offerSdp,
    _meta: { cryon: { unrolledAgentLoop: !useLegacyAgentLoop } },
  });
}

export async function acpStopLiveVoice(sessionId: string, interactionId: string): Promise<void> {
  const { cryon } = await getAcpClient();
  await cryon.sessionLiveVoiceStop_unstable({ sessionId, interactionId });
}
