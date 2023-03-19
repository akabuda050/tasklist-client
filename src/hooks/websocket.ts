/**
 * This is a duplicate of https://github.com/vueuse/vueuse/blob/main/packages/core/useWebSocket
 * Keep track original and use it once issue resolved. Create PR with fix of heartbeat issue.
 */
import type { Ref } from 'vue-demi';
import { ref } from 'vue-demi';
import type { Fn } from '@vueuse/shared';
import { tryOnScopeDispose, useIntervalFn } from '@vueuse/shared';
import { useEventListener } from '@vueuse/core';

export type WebSocketStatus = 'OPEN' | 'CONNECTING' | 'CLOSED';

const DEFAULT_PING_MESSAGE = 'ping';

export interface UseWebSocketOptions {
  onConnected?: (ws: WebSocket) => void;
  onDisconnected?: (ws: WebSocket, event: CloseEvent) => void;
  onError?: (ws: WebSocket, event: Event) => void;
  onMessage?: (ws: WebSocket, event: MessageEvent) => void;

  /**
   * Send heartbeat for every x milliseconds passed
   *
   * @default false
   */
  heartbeat?:
    | boolean
    | {
        /**
         * Message for the heartbeat
         *
         * @default 'ping'
         */
        message?: string | ArrayBuffer | Blob;

        /**
         * Interval, in milliseconds
         *
         * @default 1000
         */
        interval?: number;

        /**
         * Heartbeat response timeout, in milliseconds
         *
         * @default 1000
         */
        pongTimeout?: number;

        pongTimeoutCallback?: () => void;
      };

  /**
   * Enabled auto reconnect
   *
   * @default false
   */
  autoReconnect?:
    | boolean
    | {
        /**
         * Maximum retry times.
         *
         * Or you can pass a predicate function (which returns true if you want to retry).
         *
         * @default -1
         */
        retries?: number | (() => boolean);

        /**
         * Delay for reconnect, in milliseconds
         *
         * @default 1000
         */
        delay?: number;

        /**
         * On maximum retry times reached.
         */
        onFailed?: Fn;
      };

  /**
   * Automatically open a connection
   *
   * @default true
   */
  immediate?: boolean;

  /**
   * Automatically close a connection
   *
   * @default true
   */
  autoClose?: boolean;

  /**
   * List of one or more sub-protocol strings
   *
   * @default []
   */
  protocols?: string[];
}

export interface UseWebSocketReturn<T> {
  /**
   * Reference to the latest data received via the websocket,
   * can be watched to respond to incoming messages
   */
  data: Ref<T | null>;

  /**
   * The current websocket status, can be only one of:
   * 'OPEN', 'CONNECTING', 'CLOSED'
   */
  status: Ref<WebSocketStatus>;

  /**
   * Closes the websocket connection gracefully.
   */
  close: WebSocket['close'];

  /**
   * Reopen the websocket connection.
   * If there the current one is active, will close it before opening a new one.
   */
  open: (url: string | URL | undefined, initOptions: UseWebSocketOptions) => void;

  reconnect: Fn;

  /**
   * Sends data through the websocket connection.
   *
   * @param data
   * @param useBuffer when the socket is not yet open, store the data into the buffer and sent them one connected. Default to true.
   */
  send: (data: string | ArrayBuffer | Blob, useBuffer?: boolean) => boolean;

  /**
   * Reference to the WebSocket instance.
   */
  ws: Ref<WebSocket | undefined>;
}

function resolveNestedOptions<T>(options: T | true): T {
  if (options === true) return {} as T;
  return options;
}

const data: Ref<any | null> = ref(null);
const status = ref<WebSocketStatus>('CLOSED');
const wsRef = ref<WebSocket | undefined>();
const urlRef = ref<string | URL | undefined>();

let heartbeatPause: Fn | undefined;
let heartbeatResume: Fn | undefined;

let explicitlyClosed = false;

let retried = 0;

let bufferedData: (string | ArrayBuffer | Blob)[] = [];

let pongTimeoutWait: ReturnType<typeof setTimeout> | undefined;

/**
 * Reactive WebSocket client.
 *
 * @see https://vueuse.org/useWebSocket
 * @param url
 */
export function useWebSocket<Data = any>(): UseWebSocketReturn<Data> {
  let options = {
    onConnected: (ws: WebSocket) => {},
    onDisconnected: (ws: WebSocket, event: CloseEvent) => {},
    onError: (ws: WebSocket, event: Event) => {},
    onMessage: (ws: WebSocket, event: MessageEvent) => {},
    heartbeat: false,
    autoReconnect: false,
    immediate: true,
    autoClose: true,
    protocols: [],
  } as UseWebSocketOptions;

  // Status code 1000 -> Normal Closure https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
  const close: WebSocket['close'] = (code = 1000, reason) => {
    if (!wsRef.value) return;
    explicitlyClosed = code !== 3001 && reason !== 'pong';

    heartbeatPause?.();
    wsRef.value.close(code, reason);
  };

  const _sendBuffer = () => {
    if (bufferedData.length && wsRef.value && status.value === 'OPEN') {
      for (const buffer of bufferedData) wsRef.value.send(buffer);
      bufferedData = [];
    }
  };

  const resetHeartbeat = () => {
    clearTimeout(pongTimeoutWait);
    pongTimeoutWait = undefined;
  };

  const send = (data: string | ArrayBuffer | Blob, useBuffer = true) => {
    console.log(data);
    if (!wsRef.value || status.value !== 'OPEN') {
      if (useBuffer) bufferedData.push(data);
      return false;
    }
    _sendBuffer();

    wsRef.value.send(data);
    return true;
  };

  const _init = () => {
    if (options.heartbeat) {
      const {
        message = DEFAULT_PING_MESSAGE,
        interval = 1000,
        pongTimeout = 1000,
      } = resolveNestedOptions(options.heartbeat);

      const { pause, resume } = useIntervalFn(
        () => {
          send(message, false);
          if (pongTimeoutWait != null) return;
          pongTimeoutWait = setTimeout(() => {
            close(3001, 'pong');
          }, pongTimeout);
        },
        interval,
        { immediate: false },
      );

      heartbeatPause = pause;
      heartbeatResume = resume;
    }

    if (options.autoClose) {
      useEventListener(window, 'beforeunload', () => close());
      tryOnScopeDispose(close);
    }

    if (explicitlyClosed || typeof urlRef.value === 'undefined') return;

    const ws = new WebSocket(urlRef.value, options.protocols);
    wsRef.value = ws;
    status.value = 'CONNECTING';

    ws.onopen = () => {
      status.value = 'OPEN';
      options.onConnected?.(ws!);
      heartbeatResume?.();
      _sendBuffer();
    };

    ws.onclose = (ev) => {
      console.log('closed');
      status.value = 'CLOSED';
      wsRef.value = undefined;
      options.onDisconnected?.(ws, ev);

      if (!explicitlyClosed && options.autoReconnect) {
        const {
          retries = -1,
          delay = 1000,
          onFailed,
        } = resolveNestedOptions(options.autoReconnect);
        retried += 1;

        if (typeof retries === 'number' && (retries < 0 || retried < retries))
          setTimeout(_init, delay);
        else if (typeof retries === 'function' && retries()) setTimeout(_init, delay);
        else onFailed?.();
      }
    };

    ws.onerror = (e) => {
      options.onError?.(ws!, e);
    };

    ws.onmessage = (e: MessageEvent) => {
      if (options.heartbeat) {
        resetHeartbeat();
        const { message = DEFAULT_PING_MESSAGE } = resolveNestedOptions(options.heartbeat);
        if (e.data === message) return;
      }

      data.value = e.data;
      options.onMessage?.(ws!, e);
    };
  };

  const open = (url: string | URL | undefined, initOptions: UseWebSocketOptions = {}) => {
    urlRef.value = url;
    options = { ...options, ...initOptions };

    close();
    explicitlyClosed = false;
    retried = 0;
    _init();
  };

  const reconnect = () => {
    close();
    explicitlyClosed = false;
    retried = 0;
    _init();
  };

  return {
    data,
    status,
    close,
    send,
    open,
    reconnect,
    ws: wsRef,
  };
}
