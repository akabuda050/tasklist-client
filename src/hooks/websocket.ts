import { reactive } from 'vue';

type WebSocketState = {
  isConnected: boolean;
  socket: WebSocket | null;
};

const state: WebSocketState = reactive({
  isConnected: false,
  socket: null,
});

export type WebSocketEvent = {
  type: string;
  data: any;
};

export function useWebSocket() {
  function connect(openCallback: () => void) {
    state.socket = null;

    state.socket = new WebSocket(`wss://${window.location.hostname}:7654`);

    state.socket.addEventListener('open', () => {
      state.isConnected = true;
      openCallback();
    });

    state.socket.addEventListener('close', () => {
      state.isConnected = false;
      state.socket = null;
    });

    state.socket.addEventListener('error', (error) => {
      console.log('error after connect', error);

      state.isConnected = false;
      state.socket = null;
    });

    setInterval(() => {
      state.isConnected = state.socket?.readyState === WebSocket.OPEN;
    }, 300);
  }

  function send(eventName: string, data: any) {
    if (state.isConnected) {
      const payload = {
        type: eventName,
        data: {
          token: localStorage.getItem('token'),
          ...data,
        },
      };

      state.socket?.send(JSON.stringify(payload));
    }
  }

  function disconnect() {
    if (state.isConnected) {
      state.socket?.close();
    }

    state.socket = null;
  }

  function subscribe(callback: (event: MessageEvent) => void) {
    if (state.socket) {
      state.socket.addEventListener('message', callback);
    }
  }

  function unsubscribe(callback: (event: MessageEvent) => void) {
    if (state.socket) {
      state.socket.removeEventListener('message', callback);
    }
  }

  function parseEvent(event: MessageEvent): WebSocketEvent {
    return JSON.parse(event.data);
  }

  const isConnected = () => {
    return state.isConnected;
  };

  return {
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    parseEvent,
  };
}