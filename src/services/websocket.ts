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
  function connect(openCallback: () => void, onMessage: (webSocketEvent: WebSocketEvent) => void) {
    if (state.socket === null) {
      state.socket = new WebSocket(`ws://${window.location.hostname}:8080`);

      state.socket.addEventListener('open', () => {
        state.isConnected = true;

        openCallback();
      });

      state.socket.addEventListener('close', () => {
        state.isConnected = false;
        state.socket = null;
      });

      state.socket.addEventListener('error', () => {
        state.isConnected = false;
        state.socket = null;
      });

      state.socket?.addEventListener('message', (event: MessageEvent) => {
        const parsed = JSON.parse(event.data) as WebSocketEvent;
        onMessage(parsed);
      });

      setInterval(() => {
        state.isConnected = state.socket?.readyState === WebSocket.OPEN;
      }, 10000);
    }
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
    } else {
      alert('You are disconected');
    }
  }

  function disconnect() {
    if (state.isConnected) {
      state.socket?.close();
      state.socket = null;
    } else {
      alert('You are disconected');
    }
  }

  function subscribe(callback: (webSocketEvent: WebSocketEvent) => void) {
    if (state.isConnected) {
      state.socket?.addEventListener('message', (event: MessageEvent) => {
        const parsed = JSON.parse(event.data) as WebSocketEvent;
        if (callback) {
          callback(parsed);
        }
      });
    } else {
      alert('You are disconected');
    }
  }

  function isConnected() {
    return state.isConnected;
  }

  return {
    isConnected,
    connect,
    disconnect,
    subscribe,
    send,
  };
}
