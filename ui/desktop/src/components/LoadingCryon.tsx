import CryonLogo from './CryonLogo';
import AnimatedIcons from './AnimatedIcons';
import FlyingBird from './FlyingBird';
import { ChatState } from '../types/chatState';
import { defineMessages, useIntl } from '../i18n';

interface LoadingCryonProps {
  message?: string;
  chatState?: ChatState;
}

const i18n = defineMessages({
  loadingConversation: {
    id: 'loadingCryon.loadingConversation',
    defaultMessage: 'loading conversation...',
  },
  thinking: {
    id: 'loadingCryon.thinking',
    defaultMessage: 'cryon is thinking…',
  },
  streaming: {
    id: 'loadingCryon.streaming',
    defaultMessage: 'cryon is working on it…',
  },
  waiting: {
    id: 'loadingCryon.waiting',
    defaultMessage: 'cryon is waiting…',
  },
  compacting: {
    id: 'loadingCryon.compacting',
    defaultMessage: 'cryon is compacting the conversation...',
  },
  idle: {
    id: 'loadingCryon.idle',
    defaultMessage: 'cryon is working on it…',
  },
  restartingAgent: {
    id: 'loadingCryon.restartingAgent',
    defaultMessage: 'restarting session...',
  },
});

const STATE_ICONS: Record<ChatState, React.ReactNode> = {
  [ChatState.LoadingConversation]: <AnimatedIcons className="flex-shrink-0" cycleInterval={600} />,
  [ChatState.Thinking]: <AnimatedIcons className="flex-shrink-0" cycleInterval={600} />,
  [ChatState.Streaming]: <FlyingBird className="flex-shrink-0" cycleInterval={150} />,
  [ChatState.WaitingForUserInput]: (
    <AnimatedIcons className="flex-shrink-0" cycleInterval={600} variant="waiting" />
  ),
  [ChatState.Compacting]: <AnimatedIcons className="flex-shrink-0" cycleInterval={600} />,
  [ChatState.Idle]: <CryonLogo size="small" hover={false} />,
  [ChatState.RestartingAgent]: <AnimatedIcons className="flex-shrink-0" cycleInterval={600} />,
};

const STATE_MESSAGE_KEYS: Record<ChatState, keyof typeof i18n> = {
  [ChatState.LoadingConversation]: 'loadingConversation',
  [ChatState.Thinking]: 'thinking',
  [ChatState.Streaming]: 'streaming',
  [ChatState.WaitingForUserInput]: 'waiting',
  [ChatState.Compacting]: 'compacting',
  [ChatState.Idle]: 'idle',
  [ChatState.RestartingAgent]: 'restartingAgent',
};

const LoadingCryon = ({ message, chatState = ChatState.Idle }: LoadingCryonProps) => {
  const intl = useIntl();
  const displayMessage = message || intl.formatMessage(i18n[STATE_MESSAGE_KEYS[chatState]]);
  const icon = STATE_ICONS[chatState];

  return (
    <div className="w-full animate-fade-slide-up">
      <div
        data-testid="loading-indicator"
        className="flex items-center gap-2 text-xs text-text-primary py-2"
      >
        {icon}
        {displayMessage}
      </div>
    </div>
  );
};

export default LoadingCryon;
