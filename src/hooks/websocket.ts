import { createGlobalState, useWebSocket as createWebSocket } from '@vueuse/core';
import { useConfig } from './config';
import { useDefaultEventBus } from './events';

export const useWebSocket = createGlobalState(() => {
  const { serverUrl } = useConfig();
  const { emit } = useDefaultEventBus();

  const { status, open, close, send } = createWebSocket(serverUrl, {
    heartbeat: false,
    autoReconnect: {
      retries: 3,
      delay: 3000,
      onFailed() {
        emit('websocket.connection.failed');
      },
    },
    onConnected: () => {
      emit('websocket.connection.connected');
    },
    onDisconnected: (ws: WebSocket, event: CloseEvent) => {
      emit('websocket.connection.disconnected', event);
    },
    onError: (ws: WebSocket, event: Event) => {
      emit('websocket.connection.error', event);
    },
    onMessage: (ws: WebSocket, messageEvent: MessageEvent) => {
      if (messageEvent.data === 'pong') return;

      const event = JSON.parse(messageEvent.data);
      console.log(event);
      emit(`websocket.message.${event.type}`, event.data);
    },
  });
  return {
    status,
    open,
    close,
    send,
  };
});
