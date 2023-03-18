<script setup lang="ts">
import { onBeforeUnmount, onBeforeMount } from 'vue';
import Auth from './components/auth/Auth.vue';
import TaskList from './components/TaskList.vue';
import { useAuth } from './hooks/auth';
import { useWebSocket } from './hooks/websocket';
const auth = useAuth();
const webSocket = useWebSocket();

const onMissingToken = (message: MessageEvent) => {
  const event = JSON.parse(message.data);
  if (['no-token'].includes(event.data.error)) {
    alert(event.data.message);
    auth.logout();
  }
};

let connecting = false;
const connect = () => {
  if (!webSocket.isConnected()) {
    webSocket.unsubscribe(onMissingToken);
    connecting = true;
    webSocket.connect(() => {
      checkAuth();
    });

    webSocket.subscribe(onMissingToken);
  }
};

const checkAuth = () => {
  auth.checkAuth().then((res: boolean) => {
    if (res) {
      webSocket.send('list', {});
      connecting = false;
    }
  });
};

connect();

const interval = window.setInterval(() => {
  if (!connecting) {
    connect();
  }
}, 300);

onBeforeUnmount(() => {
  if (interval !== null) {
    window.clearInterval(interval);
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
