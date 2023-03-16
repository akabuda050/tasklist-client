<template>
  <div class="h-full relative">
    <div
      v-if="formOppened"
      tabindex="-1"
      aria-hidden="true"
      class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] md:h-full"
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
                  taskList.add(socket, taskName);
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
                    class="px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
                    v-model="taskName"
                  />
                </div>
              </div>
              <div class="mt-6 text-right">
                <button
                  class="bg-sky-500 hover:bg-sky-700 px-2 py-1 text-sm leading-5 rounded-md font-semibold text-white"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-md mx-auto bg-white shadow py-5 px-6">
      <div class="flex items-center justify-between">
        <h2 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Tasks:</h2>
        <button
          class="bg-sky-500 hover:bg-sky-700 px-2 py-1 mr-2 text-sm leading-5 rounded-md font-semibold text-white"
          @click="() => (formOppened = true)"
        >
          New
        </button>
      </div>
      <div class="mb-2">
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
      <div v-if="!tasksFiltered.length" class="max-w-md mx-auto bg-white shadow p-5">
        <span class="font-semibold">There are no tasks. Add one.</span>
      </div>
      <div v-else class="max-w-md mx-auto bg-white overflow-hidden">
        <ul
          class="max-w-md max-h-[500px] pr-1.5 space-y-1 text-gray-500 list-inside dark:text-gray-400 overflow-y-auto"
        >
          <li
            v-for="task in tasksFiltered"
            :key="task.id"
            class="flex items-center p-3 my-2 border"
          >
            <div class="flex flex-col items-start">
              <div class="mb-2">
                <div class="flex items-center mr-2 text-lg">
                  <h3 class="mr-2 font-semibold max-w-[300px] truncate">
                    {{ task.id }}: {{ task.name }}
                  </h3>
                  <svg
                    v-if="task.completed_at"
                    class="w-4 h-4 mr-1.5 text-green-500 dark:text-green-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <svg
                    v-else
                    class="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
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
                  class="bg-sky-500 hover:bg-sky-700 px-2 py-1 mr-2 text-sm leading-5 rounded-md font-semibold text-white"
                  @click="() => taskList.start(socket, task)"
                >
                  Start
                </button>
                <button
                  class="bg-sky-500 hover:bg-sky-700 px-2 py-1 mr-2 text-sm leading-5 rounded-md font-semibold text-white"
                  @click="() => taskList.complete(socket, task)"
                >
                  Complete
                </button>
                <button
                  class="bg-sky-500 hover:bg-sky-700 px-2 py-1 mr-2 text-sm leading-5 rounded-md font-semibold text-white"
                  @click="() => taskList.remove(socket, task)"
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
import { useTasks, type Task } from '@/stores/tasks';
import { ref, watch, computed } from 'vue';
const taskList = useTasks();
const taskName = ref('');
const filters = ref({
  sort_by: 'created_at',
  sort_dir: 'asc',
  status: 'all',
});
const formOppened = ref(false);

const tasksFiltered = computed(() => {
  return taskList.tasks.filter((t) => {
    if (filters.value.status === 'in_progress') {
      return t.started_at && !t.completed_at;
    } else if (filters.value.status === 'completed') {
      return t.started_at && t.completed_at;
    } else if (filters.value.status === 'pending') {
      return !t.started_at && !t.completed_at;
    }

    return t.id;
  });
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
    console.log(sortFilters);
    taskList.sort(sortFilters[1], sortFilters[2]);
  },
);

// Create WebSocket connection.
const socket = new WebSocket('ws://localhost:8080');
let params = new URLSearchParams(window.location.search);
const username = params.get('username');
if (username) {
  taskList.setUserName(username);

  const interval = setInterval(() => {
    if (socket.readyState === socket.OPEN) {
      clearInterval(interval);
      socket.send(
        JSON.stringify({
          type: 'login',
          username,
        }),
      );
    }
  });
}

// Listen for messages
socket.addEventListener('message', (event: MessageEvent) => {
  const data = JSON.parse(event.data);
  if (data.type === 'error') {
    alert(data.message);
  }

  if (data.type === 'list') {
    taskList.setList(data.tasks);
  }

  if (data.type === 'created') {
    taskList.addToList(data.task);
  }

  if (data.type === 'updated') {
    taskList.updateInList(data.task);
  }

  if (data.type === 'deleted') {
    taskList.deleteFromList(data.task);
  }
});
</script>
