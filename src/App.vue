<script setup lang="ts">
import { onBeforeUnmount, onBeforeMount } from 'vue';
import Auth from './components/auth/Auth.vue';
import TaskList from './components/TaskList.vue';
import { useAuth } from './hooks/auth';
import { useWebSocket } from './hooks/websocket';
const auth = useAuth();
const webSocket = useWebSocket();

const onConnection = () => {
  auth.checkAuth().then((res: boolean) => {
    if (res) {
      webSocket.send('list', {});
    }
  });
};

const onMissingToken = (message: MessageEvent) => {
  const event = JSON.parse(message.data);
  if (['no-token'].includes(event.data.error)) {
    alert(event.data.message);
    auth.logout();
  }
};

// @ts-ignore
let interval: number| null = null;

onBeforeMount(() => {
  if (!webSocket.isConnected()) {
    webSocket.unsubscribe(onMissingToken);

    webSocket.connect(onConnection);
    webSocket.subscribe(onMissingToken);
  }

  interval = setInterval(() => {
    if (!webSocket.isConnected()) {
      webSocket.unsubscribe(onMissingToken);

      webSocket.connect(onConnection);
      webSocket.subscribe(onMissingToken);
    }
  }, 300);
});

onBeforeUnmount(() => {
  if (interval !== null) {
    clearInterval(interval);
  }
});
</script>

<template>
  <div class="container mx-auto">
    <div v-if="!webSocket.isConnected()">
      <div class="flex items-center justify-center h-screen">
        <div class="flex flex-col mx-auto justify-start">
          <h1 class="text-lg font-bold">Connecting...</h1>
        </div>
      </div>
    </div>
    <template v-else>
      <TaskList v-if="auth.isAuthenticated()" />
      <div v-else>
        <Auth v-if="!auth.isAuthenticated()" />
      </div>
    </template>
  </div>
</template>
