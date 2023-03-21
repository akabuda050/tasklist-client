<template>
  <div class="flex flex-col items-start h-full bg-white min-h-[200px] p-3 border rounded-lg shadow">
    <div class="flex flex-col w-full mb-2 h-full border-b">
      <div class="flex items-center justify-between text-lg border-b pb-1 mb-2">
        <div class="flex items-center">
          <h3 class="font-semibold max-w-[240px] truncate mr-2">
            {{ props.task.name }}
          </h3>
          <span
            class="w-3 h-3 flex-shrink-0 rounded-full"
            :class="{
              'bg-yellow-400': taskStateMap.started,
              'bg-gray-400': taskStateMap.unStarted,
              'bg-green-500': taskStateMap.completed,
            }"
          ></span>
        </div>
        <button
          :disabled="disabled"
          class="disabled:text-gray-200 text-red-500 hover:text-red-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
          title="Remove"
          @click="() => taskStore.remove(task)"
        >
          <FontAwesomeIcon icon="fa-solid fa-trash" size="lg"></FontAwesomeIcon>
        </button>
      </div>
      <div class="flex items-start text-lg gap-2">
        <div class="flex flex-col items-start gap-2">
          <span class="text-sm font-semibold">Created: </span>
          <span class="text-sm font-semibold">Started: </span>
          <span class="text-sm font-semibold">Completed: </span>
        </div>
        <div class="flex flex-col items-start gap-2">
          <span class="text-sm font-normal">{{ createdAt(task) }}</span>
          <span class="text-sm font-normal">{{ startedAt(task) }}</span>
          <span class="text-sm font-normal">{{ completedAt(task) }}</span>
        </div>
      </div>
    </div>
    <div class="w-full flex items-center justify-between">
      <span class="mr-2">
        <span class="text-sm font-semibold"
          >Spent time:
          <span class="text-sm font-normal"> {{ currentAt(task) }}</span>
        </span>
      </span>

      <div class="flex items-center justify-end gap-2">
        <template v-if="!taskStateMap.completed">
          <button
            v-if="taskStateMap.unStarted"
            :disabled="disabled"
            class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
            title="Start"
            @click="() => taskStore.start(task)"
          >
            <FontAwesomeIcon icon="fa-regular fa-circle-play" size="xl"></FontAwesomeIcon>
          </button>
          <button
            v-if="taskStateMap.running"
            :disabled="disabled"
            class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
            title="Pause"
            @click="() => taskStore.pause(task)"
          >
            <FontAwesomeIcon icon="fa-regular fa-circle-pause" size="xl"></FontAwesomeIcon>
          </button>
          <button
            v-if="taskStateMap.paused"
            :disabled="disabled"
            class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
            title="Resume"
            @click="() => taskStore.resume(task)"
          >
            <FontAwesomeIcon icon="fa-regular fa-circle-play" size="xl"></FontAwesomeIcon>
          </button>
          <button
            :disabled="disabled"
            class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
            title="Complete"
            @click="() => taskStore.complete(task)"
          >
            <FontAwesomeIcon icon="fa-solid fa-flag-checkered" size="xl"></FontAwesomeIcon>
          </button>
        </template>
        <template v-if="taskStateMap.completed">
          <button
            :disabled="disabled"
            class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
            title="Restart"
            @click="() => taskStore.restart(task)"
          >
            <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-right" size="xl"></FontAwesomeIcon>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useWebSocket } from '@/hooks/websocket';
import { useTasks, type Task } from '@/stores/tasks';
import { useDateFormat } from '@vueuse/shared';
import { computed, ref, type PropType } from 'vue';

const props = defineProps({
  task: {
    type: Object as PropType<Task>,
    required: true,
  },
});

const { status } = useWebSocket();

const disabled = computed(() => {
  return status.value !== 'OPEN';
});

const taskStateMap = computed(() => ({
  unStarted: !props.task.started_at && !props.task.completed_at,
  started: !!props.task.started_at && !props.task.completed_at,
  paused: !!props.task.paused_at,
  running: !!props.task.started_at && !props.task.completed_at && !props.task.paused_at,
  completed: !!props.task.completed_at,
}));

const taskStore = useTasks();

const currentAt = (task: Task) => {
  const totalElapsed = taskStore.calculateElapsed(task);

  const days = Math.floor(totalElapsed / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalElapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((totalElapsed % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalElapsed % (1000 * 60)) / 1000);

  if (days < 0 || hours < 0 || minutes < 0 || seconds < 0) return '0s';

  return `${days ? days + 'd ' : ''}${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm ' : ''}${
    seconds + 's'
  }`;
};

const createdAt = (task: Task) => {
  return useDateFormat(task.created_at, 'MM/DD/YY HH:mm:ss A').value;
};

const startedAt = (task: Task) => {
  return task.started_at ? useDateFormat(task.started_at, 'MM/DD/YY HH:mm:ss A').value : '-';
};

const completedAt = (task: Task) => {
  return task.completed_at ? useDateFormat(task.completed_at, 'MM/DD/YY HH:mm:ss A').value : '-';
};
</script>
