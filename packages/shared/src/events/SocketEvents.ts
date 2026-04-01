export const SOCKET_EVENTS = {
  CHAT_JOIN:      'chat:join',
  CHAT_LEAVE:     'chat:leave',
  CHAT_MESSAGE:   'chat:message',
  VIEWER_UPDATE:  'viewer:update',
  MATCH_UPDATE:   'match:update',
  SYSTEM_MESSAGE: 'system:message',
} as const;

export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
