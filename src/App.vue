<script setup lang="ts">
import { ref } from 'vue';
import Auth from './components/auth/Auth.vue';
import TaskList from './components/TaskList.vue';
import { useWebSocket } from './hooks/websocket';
import { useEventBus } from '@vueuse/core';
import { useAuth } from './hooks/auth';
import { useConfig } from './hooks/config';

const retriesExided = ref(false);
const { on, emit } = useEventBus<string>('default');

on((event: string, payload: any) => {
  if (event === 'error') {
    alert(payload?.data?.message);
  }
});

const { send, open, reconnect } = useWebSocket();

const { serverUrl } = useConfig();
open(serverUrl, {
  heartbeat: {
    message: 'ping',
    interval: 10000,
    pongTimeout: 2000,
  },
  autoReconnect: {
    retries: 3,
    delay: 3000,
    onFailed() {
      console.log('onFailed');

      retriesExided.value = true;
    },
  },
  onConnected: (ws: WebSocket) => {
    console.log('onConnected');

    useAuth()
      .checkAuth()
      .then((res) => {
        if (res) {
          send(
            JSON.stringify({
              type: 'list',
              data: {
                token: localStorage.getItem('token'),
              },
            }),
          );
        }
      });
  },
  onDisconnected: (ws: WebSocket, event: CloseEvent) => {
    console.log('onDisconnected');
  },
  onError: (ws: WebSocket, event: Event) => {
    console.log('onError');
  },
  onMessage: (ws: WebSocket, messageEvent: MessageEvent) => {
    if (messageEvent.data === 'pong') return;

    const event = JSON.parse(messageEvent.data);

    if (event?.type) {
      emit(event.type, event);
    }
  },
});

useAuth().checkAuth();
</script>

<template>
  <div class="container mx-auto">
    <div
      v-if="retriesExided"
      class="z-10 shadow bg-gray-200 flex items-center justify-center w-[70px] h-[70px] rounded-full cursor-pointer fixed bottom-[30px] right-[15px]"
      @click="
        () => {
          retriesExided = false;
          reconnect();
        }
      "
    >
      <font-awesome-icon icon="fa-solid fa-plug" beat size="2x" class="text-red-300" />
    </div>

    <TaskList v-if="useAuth().state.isAuthenticated" />
    <Auth v-else />
  </div>
</template>
