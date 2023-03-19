<script setup lang="ts">
import { ref } from 'vue';
import Auth from './components/auth/Auth.vue';
import TaskList from './components/TaskList.vue';
import { useWebSocket } from './hooks/websocket';
import { useEventBus } from '@vueuse/core';
import { useAuth } from './hooks/auth';

const retriesExided = ref(false);
const { on, emit } = useEventBus<string>('default');

on((event: string, payload: any) => {
  if (event === 'error') {
    alert(payload?.data?.message);
  }
});

const { status, open, reconnect } = useWebSocket();

open('ws://localhost:7654', {
  heartbeat: {
    message: 'ping',
    interval: 10000,
    pongTimeout: 2000,
  },
  autoReconnect: {
    retries: 3,
    delay: 1000,
    onFailed() {
      console.log('onFailed');

      retriesExided.value = true;
    },
  },
  onConnected: (ws: WebSocket) => {
    console.log('onConnected');

    useAuth().checkAuth();
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
</script>

<template>
  <div class="container mx-auto">
    <div v-if="status !== 'OPEN'">
      <div class="flex items-center justify-center h-screen">
        <div class="flex flex-col mx-auto justify-start">
          <h1 class="text-lg font-bold capitalize">{{ status }}</h1>

          <button
            v-if="retriesExided"
            @click="
              () => {
                retriesExided = false;
                reconnect();
              }
            "
          >
            Reconect
          </button>
        </div>
      </div>
    </div>
    <template v-else>
      <TaskList v-if="useAuth().isAuthenticated()" />
      <Auth v-else />
    </template>
  </div>
</template>
