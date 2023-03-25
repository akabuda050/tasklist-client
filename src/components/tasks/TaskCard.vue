<template>
  <div class="flex flex-col items-start h-full bg-white p-3 rounded-lg shadow">
    <div
      class="flex flex-col w-full mb-2 h-full border-b"
      :class="{
        'pb-2': withDetails,
      }"
    >
      <div
        class="flex items-center justify-between text-lg pb-1"
        :class="{
          'border-b mb-2': withDetails,
        }"
      >
        <div class="flex items-center gap-2">
          <div
            class="flex items-center font-semibold min-h-[20px] min-w-[50px] max-w-[240px] cursor-pointer"
          >
            <h3
              v-if="!showNameInput"
              data-test="name"
              class="truncate"
              :title="task.name"
              @click="
                () => {
                  if (task.completed_at) {
                    return;
                  }
                  showNameInput = !showNameInput;
                  $nextTick(() => {
                    nameInputRef?.focus();
                  });
                }
              "
            >
              {{ task.name }}
            </h3>
            <input
              data-test="name-input"
              v-else
              type="text"
              v-model="nameInputValue"
              ref="nameInputRef"
              @keydown.enter="saveName"
              class="outline-none"
            />
          </div>
          <span
            data-test="status-color"
            :class="{
              'w-3 h-3 rounded-full': true,
              'bg-yellow-400': taskStateMap.started,
              'bg-gray-400': taskStateMap.pending,
              'bg-green-500': taskStateMap.completed,
            }"
          ></span>
        </div>
        <button
          data-test="remove-button"
          :disabled="disabled"
          class="disabled:text-gray-200 text-red-500 hover:text-red-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
          title="Remove"
          @click="() => taskStore.remove(task)"
        >
          <FontAwesomeIcon icon="fa-solid fa-trash" size="lg"></FontAwesomeIcon>
        </button>
      </div>
      <div v-if="withDetails" class="flex items-start text-lg gap-2" data-test="details">
        <div class="flex flex-col items-start gap-2">
          <span class="text-sm font-semibold">Created: </span>
          <span class="text-sm font-semibold">Started: </span>
          <span class="text-sm font-semibold">Completed: </span>
        </div>
        <div class="flex flex-col items-start gap-2">
          <span class="text-sm font-normal" data-test="created-at">{{ createdAt(task) }}</span>
          <span class="text-sm font-normal" data-test="started-at">{{ startedAt(task) }}</span>
          <span class="text-sm font-normal" data-test="completed-at">{{ completedAt(task) }}</span>
        </div>
      </div>
    </div>
    <div class="w-full flex items-center justify-between">
      <div
        data-test="priority"
        class="flex items-center justify-center text-left px-2 rounded-lg text-sm capitalize font-semibold cursor-pointer"
        :class="{
          [priorityMap[task.priority || 'low'].colorsClasses]: true,
          'py-1': !showPrioritySelect,
        }"
      >
        <span
          data-test="priority-label"
          v-if="!showPrioritySelect"
          @click="
            () => {
              if (!task.completed_at) {
                showPrioritySelect = true;
              }
            }
          "
        >
          {{ task.priority || 'low' }}
        </span>
        <select
          v-if="showPrioritySelect"
          data-test="priority-select"
          ref="prioritySelect"
          :value="task.priority || 'low'"
          class="rounded-md outline-none py-1"
          :class="priorityMap[task.priority || 'low'].colorsClasses"
          @change="savePriority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="hight">Hight</option>
          <option value="top">Top</option>
        </select>
      </div>

      <div class="flex flex-grow items-center justify-center" data-test="elapsed-time">
        <span class="text-md font-bold"> {{ currentAt(task) }}</span>
      </div>

      <div class="flex items-center justify-end gap-4">
        <template v-if="!taskStateMap.completed">
          <button
            v-if="taskStateMap.pending"
            data-test="start-button"
            :disabled="disabled"
            class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
            title="Start"
            @click="start"
          >
            <FontAwesomeIcon icon="fa-regular fa-circle-play" size="xl"></FontAwesomeIcon>
          </button>
          <button
            v-if="taskStateMap.running"
            data-test="pause-button"
            :disabled="disabled"
            class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
            title="Pause"
            @click="() => taskStore.pause(task)"
          >
            <FontAwesomeIcon icon="fa-regular fa-circle-pause" size="xl"></FontAwesomeIcon>
          </button>
          <button
            v-if="taskStateMap.paused"
            data-test="resume-button"
            :disabled="disabled"
            class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
            title="Resume"
            @click="() => taskStore.resume(task)"
          >
            <FontAwesomeIcon icon="fa-regular fa-circle-play" size="xl"></FontAwesomeIcon>
          </button>
          <button
            :disabled="disabled"
            data-test="complete-button"
            class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
            title="Complete"
            @click="() => taskStore.complete(task)"
          >
            <FontAwesomeIcon icon="fa-solid fa-flag-checkered" size="xl"></FontAwesomeIcon>
          </button>
        </template>
        <template v-if="taskStateMap.completed">
          <button
            data-test="restart-button"
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
import { useDefaultEventBus } from '@/hooks/events';
import { useWebSocket } from '@/hooks/websocket';
import { useTasks, priorityMap, type Task } from '@/stores/tasks';
import { onClickOutside } from '@vueuse/core';
import { useDateFormat } from '@vueuse/shared';
import { computed, ref, type PropType } from 'vue';

const props = defineProps({
  task: {
    type: Object as PropType<Task>,
    required: true,
  },
  withDetails: {
    type: Boolean,
    default: false,
  },
});

const { status } = useWebSocket();
const { on } = useDefaultEventBus();
on((event: string, payload: any) => {
  if (event === 'websocket.message.updated') {
    console.log(`${event}: task card ${props.task.id}`);

    taskStore.updateInList(payload?.task);
  }
});

const disabled = computed(() => {
  return status.value !== 'OPEN';
});

const taskStateMap = computed(() => ({
  pending: !props.task.started_at && !props.task.completed_at,
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

const showPrioritySelect = ref(false);
const prioritySelect = ref(null);
onClickOutside(prioritySelect, () => {
  showPrioritySelect.value = !showPrioritySelect.value;
});

const savePriority = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  if (!select.value) {
    alert('Wrong priority!');
    return;
  }

  taskStore.updatePriority(props.task.id, select.value);

  showPrioritySelect.value = false;
};

const showNameInput = ref(false);
const nameInputRef = ref<HTMLInputElement | null>(null);
const nameInputValue = ref<string>(props.task.name);
onClickOutside(nameInputRef, () => {
  saveName();
});

const saveName = () => {
  showNameInput.value = false;
  if (!nameInputValue.value) {
    nameInputValue.value = props.task.name;
    return;
  }

  if (nameInputValue.value === props.task.name) {
    return;
  }

  taskStore.updateName(props.task.id, nameInputValue.value);
};

const start = () => {
  taskStore.start(props.task);
};
</script>
