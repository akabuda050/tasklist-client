<script setup lang="ts">
import { ref } from 'vue';
import Auth from './components/auth/Auth.vue';
import TaskList from './components/TaskList.vue';
import { useWebSocket } from './hooks/websocket';
import { useAuth } from './hooks/auth';
import { useDefaultEventBus } from './hooks/events';

const { on } = useDefaultEventBus();
const retriesExided = ref(false);

on((event: string, payload: any) => {
  if (event === 'websocket.connection.failed') {
    retriesExided.value = true;
  }
  if (event === 'websocket.message.loggedin') {
    useAuth().authenticate(payload.token, payload.username);
  }
});

const { open } = useWebSocket();

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
          open();
        }
      "
    >
      <font-awesome-icon icon="fa-solid fa-plug" beat size="2x" class="text-red-300" />
    </div>

    <TaskList v-if="useAuth().state.isAuthenticated" />
    <Auth v-else />
  </div>
</template>
