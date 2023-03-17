<template>
  <div class="bg-white h-full mx-auto relative">
    <div
      v-if="formOppened"
      tabindex="-1"
      aria-hidden="true"
      class="flex items-center justify-center fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full"
    >
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div class="relative min-w-[325px] max-w-[500px] mx-auto">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <button
            type="button"
            class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
            @click="
              () => {
                formOppened = false;
                taskName = '';
              }
            "
          >
            <svg
              aria-hidden="true"
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
          <div class="px-6 py-6 lg:px-8">
            <form
              @submit.prevent="
                () => {
                  if (!taskName) {
                    missingName('Enter task name!');
                    return;
                  }
                  taskList.add(taskName);
                  formOppened = false;
                  taskName = '';
                }
              "
            >
              <div>
                <label for="username" class="block text-sm font-medium text-slate-700"
                  >Task name</label
                >
                <div class="mt-1">
                  <input
                    type="text"
                    name="taskName"
                    id="taskName"
                    placeholder="Enter task name"
                    class="px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
                    v-model="taskName"
                  />
                </div>
              </div>
              <div class="mt-6 text-right">
                <button
                  class="bg-sky-500 hover:bg-sky-700 px-2 py-1 text-sm leading-5 rounded-md font-semibold text-white"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="sticky top-0 bg-white shadow flex flex-col rounded border-b">
      <div class="flex items-center justify-between py-2 px-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h2>
        <div class="flex">
          <button
            class="hidden bg-sky-500 hover:bg-sky-700 px-2 py-1 mr-2 text-sm leading-5 rounded-md font-semibold text-white"
            @click="() => (formOppened = true)"
          >
            New
          </button>
          <button
            class="bg-sky-500 hover:bg-sky-700 px-2 py-1 mr-2 text-sm leading-5 rounded-md font-semibold text-white"
            @click="() => (filtersOpened = !filtersOpened)"
          >
            Filter
          </button>
          <button
            class="bg-sky-500 hover:bg-sky-700 px-2 py-1 mr-2 text-sm leading-5 rounded-md font-semibold text-white"
            @click="() => auth.logout()"
          >
            Logout
          </button>
        </div>
      </div>

      <div
        v-if="filtersOpened"
        class="flex items-start justify-start flex-col sm:flex-row sm:items-center px-2"
      >
        <div class="flex items-center">
          <select class="p-2 m-2 border appereance-none" v-model="filters.status">
            <option value="all">All</option>
            <option value="pending">Unstarted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div class="flex items-center">
          <select class="p-2 m-2 border appereance-none" v-model="filters.sort_by">
            <option value="created_at">Sort by created</option>
            <option value="started_at">Sort by started</option>
            <option value="completed_at">Sort by completed</option>
            <option value="current_at">Sort by time taken</option>
          </select>
          <select class="p-2 m-2 border appereance-none" v-model="filters.sort_dir">
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </div>
    </div>
    <div
      class="bg-white shadow py-2 px-6 rounded"
      :class="[`min-h-[calc(100vh_-_${filtersOpened ? '110px' : '45px'})] `]"
    >
      <div class="mx-auto bg-white">
        <div class="flex items-center justify-between mb-2">
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Enter task name to search"
            class="mr-2 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-sky-500 block w-full rounded-md sm:text-sm invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
            v-model="search"
          />
          <button
            v-if="tasksFiltered.length"
            class="bg-sky-500 hover:bg-sky-700 px-2 py-1 text-sm leading-5 rounded-md font-semibold text-white"
            @click="() => (formOppened = true)"
          >
            Create
          </button>
        </div>
        <div
          v-if="!tasksFiltered.length"
          class="border-t min-h-[550px] max-h-[550px] pr-1.5 space-y-1 flex flex-col items-center justify-center"
        >
          <span class="font-semibold">There are no tasks.</span>
          <button
            class="bg-sky-500 hover:bg-sky-700 px-2 py-1 text-sm leading-5 rounded-md font-semibold text-white"
            @click="() => (formOppened = true)"
          >
            Create
          </button>
        </div>
        <ul
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-2 gap-4 text-gray-500 list-inside dark:text-gray-400"
        >
          <li v-for="task in tasksFiltered" :key="`${task.id}`" class="h-[200px] p-3 border">
            <div class="flex flex-col items-start">
              <div class="mb-2">
                <div class="flex items-center mr-2 text-lg">
                  <h3 class="mr-2 font-semibold max-w-[300px] truncate">
                    {{ task.name }}
                  </h3>
                  <span
                    class="w-3 h-3 flex-shrink-0 rounded-full"
                    :class="{
                      'bg-yellow-400': !!task.started_at && !task.completed_at,
                      'bg-gray-400': !task.started_at && !task.completed_at,
                      'bg-green-500': !!task.completed_at,
                    }"
                  ></span>
                </div>
                <div class="flex flex-col items-start mr-2 text-lg">
                  <span class="mr-2">
                    <span class="text-sm font-semibold"
                      >Created at:
                      <span class="text-sm font-normal">{{ createdAt(task) }}</span>
                    </span>
                  </span>
                  <span class="mr-2">
                    <span class="text-sm font-semibold"
                      >Started at:
                      <span class="text-sm font-normal">{{ startedAt(task) }}</span>
                    </span>
                  </span>
                  <span class="mr-2">
                    <span class="text-sm font-semibold"
                      >Completed at:
                      <span class="text-sm font-normal">{{ completedAt(task) }}</span>
                    </span>
                  </span>
                  <span class="mr-2">
                    <span class="text-sm font-semibold"
                      >Spent time:
                      <span class="text-sm font-normal"> {{ currentAt(task) }}</span>
                    </span>
                  </span>
                </div>
              </div>
              <div>
                <button
                  :disabled="!!task.started_at && !task.completed_at"
                  class="disabled:bg-gray-200 bg-sky-500 hover:bg-sky-700 px-2 py-1 mr-2 text-sm leading-5 rounded-md font-semibold text-white"
                  @click="
                    () => {
                      if (!!task.started_at && !task.completed_at) return;
                      taskList.start(task);
                    }
                  "
                >
                  {{ !!task.started_at && task.completed_at ? 'Restart' : 'Start' }}
                </button>
                <button
                  :disabled="!!task.completed_at"
                  class="disabled:bg-gray-200 bg-sky-500 hover:bg-sky-700 px-2 py-1 mr-2 text-sm leading-5 rounded-md font-semibold text-white"
                  @click="() => taskList.complete(task)"
                >
                  Complete
                </button>
                <button
                  class="bg-sky-500 hover:bg-sky-700 px-2 py-1 mr-2 text-sm leading-5 rounded-md font-semibold text-white"
                  @click="() => taskList.remove(task)"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '@/services/auth';
import { useWebSocket, type WebSocketEvent } from '@/services/websocket';
import { useTasks, type Task } from '@/stores/tasks';
import { ref, watch, computed } from 'vue';
const taskList = useTasks();
const taskName = ref('');
const filters = ref({
  sort_by: 'created_at',
  sort_dir: 'desc',
  status: 'all',
});

const auth = useAuth();
const filtersOpened = ref(false);
const formOppened = ref(false);

const search = ref('');
const missingName = (messages: string) => {
  alert(messages);
};
const tasksFiltered = computed(() => {
  let tasks = taskList.tasks.filter((t) => {
    if (filters.value.status === 'in_progress') {
      return t.started_at && !t.completed_at;
    } else if (filters.value.status === 'completed') {
      return t.started_at && t.completed_at;
    } else if (filters.value.status === 'pending') {
      return !t.started_at && !t.completed_at;
    }

    return t.id;
  });

  if (search.value) {
    tasks = tasks.filter((t) => new RegExp(search.value).test(t.name));
  }

  return tasks;
});

const currentAt = (task: Task) => {
  if (!task.started_at || !task.current_at) return '0s';

  const days = Math.floor((task.current_at - task.started_at) / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    ((task.current_at - task.started_at) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor(
    ((task.current_at - task.started_at) % (1000 * 60 * 60)) / (1000 * 60),
  );
  const seconds = Math.floor(((task.current_at - task.started_at) % (1000 * 60)) / 1000);

  return `${days ? days + 'd ' : ''}${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm ' : ''}${
    seconds + 's'
  }`;
};

const createdAt = (task: Task) => {
  return new Date(task.created_at).toLocaleString('en-US', { timeZone: 'UTC' });
};

const startedAt = (task: Task) => {
  return task.started_at
    ? new Date(task.started_at).toLocaleString('en-US', { timeZone: 'UTC' })
    : 'N/A';
};

const completedAt = (task: Task) => {
  return task.completed_at
    ? new Date(task.completed_at).toLocaleString('en-US', { timeZone: 'UTC' })
    : 'N/A';
};

watch(
  () => [filters.value.status, filters.value.sort_by, filters.value.sort_dir],
  (sortFilters) => {
    taskList.sort(sortFilters[1], sortFilters[2]);
  },
);

// Create WebSocket connection.
const webSocket = useWebSocket();

// Listen for messages
webSocket.subscribe((event: WebSocketEvent) => {
  if (event.type === 'list') {
    taskList.setList(event.data?.tasks || []);
    taskList.sort(filters.value.sort_by, filters.value.sort_dir);
  }

  if (event.type === 'created') {
    taskList.addToList(event.data?.task);
  }

  if (event.type === 'updated') {
    taskList.updateInList(event.data?.task);
  }

  if (event.type === 'deleted') {
    taskList.deleteFromList(event.data?.task);
  }
});

setInterval(() => {
  taskList.tasks = taskList.tasks.map((t) => {
    if (t.completed_at) return t;

    const timestamp = new Date().getTime();
    t.current_at = timestamp;

    return t;
  });
}, 1000);
</script>
