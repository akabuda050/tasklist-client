<script setup lang="ts">
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

if (!webSocket.isConnected()) {
  webSocket.connect(onConnection);
}

setInterval(() => {
  if (!webSocket.isConnected()) {
    webSocket.connect(onConnection);
  }
}, 5000);
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
