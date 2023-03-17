<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import Auth from './components/auth/Auth.vue';
import TaskList from './components/TaskList.vue';
import { useAuth } from './services/auth';
import { useWebSocket } from './services/websocket';
const auth = useAuth();
const webSocket = useWebSocket();
const mounted = ref(false);
onBeforeMount(() => {
  auth.checkAuth(mounted);
});
</script>

<template>
  <div class="container mx-auto">
    <template v-if="mounted">
      <TaskList v-if="auth.isAuthenticated() && webSocket.isConnected()" />
      <div v-else>
        <Auth v-if="!auth.isAuthenticated() && !webSocket.isConnected()" />
        <div v-else>
          <div class="flex items-center justify-center h-screen">
            <div class="flex flex-col mx-auto justify-start">
              <h1 class="text-lg font-bold">Trying to reconnect...</h1>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
