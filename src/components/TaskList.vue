<template>
  <div class="h-full mx-auto relative">
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
                    class="px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-teal-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
                    v-model="taskName"
                  />
                </div>
              </div>
              <div class="mt-6 text-right">
                <button
                  type="submit"
                  class="bg-teal-500 hover:bg-teal-700 px-2 py-1 text-sm leading-5 rounded-md font-semibold text-white"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="sticky top-0 bg-white shadow flex flex-col rounded border-b z-10 py-2 px-4">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold max-w-[200px] truncate mr-2">{{
            useAuth().state.userName
          }}</span>
          <FontAwesomeIcon
            icon="fa-solid fa-wifi"
            :beat="status === 'CONNECTING'"
            size="xl"
            :class="{
              'text-yellow-400': status === 'CONNECTING',
              'text-green-400': status === 'OPEN',
              'text-red-500': status === 'CLOSED',
            }"
          />
        </div>
        <div class="flex">
          <button
            title="Filter"
            class="disabled:text-gray-200 text-teal-500 hover:text-teal-700 disabled:hover:text-gray-200 mr-4 enabled:cursor-pointer"
            @click="() => (filtersOpened = !filtersOpened)"
          >
            <FontAwesomeIcon
              :icon="`fa-solid ${filtersOpened ? 'fa-filter-circle-xmark' : 'fa-filter'}`"
              size="xl"
            />
          </button>
          <button
            :disabled="status !== 'OPEN'"
            title="Logout"
            class="disabled:text-gray-500 text-teal-500 enabled:hover:text-teal-700 p-1 border-2 disabled:border-gray-500 border-teal-500 hover:border-teal-700 rounded-[5px]"
            @click="() => auth.logout()"
          >
            <FontAwesomeIcon icon="fa-solid fa-person-running" size="xl" />
          </button>
        </div>
      </div>

      <div v-if="filtersOpened" class="flex items-center justify-between flex-row mb-2">
        <div class="flex items-center">
          <select
            class="p-1 mr-2 border-2 border-teal-500 hover:border-teal-700 rounded-[5px] appereance-none"
            v-model="filters.status"
          >
            <option value="all">All</option>
            <option value="pending">Unstarted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div class="flex items-center">
          <select
            class="p-1 mr-2 border-2 border-teal-500 hover:border-teal-700 rounded-[5px] appereance-none"
            v-model="filters.sort_by"
          >
            <option value="created_at">Sort by created</option>
            <option value="started_at">Sort by started</option>
            <option value="completed_at">Sort by completed</option>
            <option value="current_at">Sort by time taken</option>
          </select>

          <button
            :disabled="status !== 'OPEN'"
            title="Logout"
            class="disabled:text-gray-500 text-teal-500 enabled:hover:text-teal-700 p-1 border-2 border-teal-500 hover:border-teal-700 rounded-[5px]"
            @click="() => (filters.sort_dir = filters.sort_dir === 'asc' ? 'desc' : 'asc')"
          >
            <FontAwesomeIcon
              :icon="`fa-solid ${
                filters.sort_dir === 'asc' ? 'fa-arrow-up-wide-short' : 'fa-arrow-down-wide-short'
              }`"
              size="xl"
            />
          </button>
        </div>
      </div>

      <div v-if="filtersOpened" class="flex items-center justify-between mb-2">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Enter task name to search"
          class="mr-2 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-teal-500 block w-full rounded-md sm:text-sm invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
          v-model="search"
        />

        <button
          title="Add"
          :disabled="status !== 'OPEN'"
          class="disabled:text-gray-200 text-teal-500 hover:text-teal-700 disabled:hover:text-gray-200 mr-2 enabled:cursor-pointer"
          @click="() => (formOppened = true)"
        >
          <FontAwesomeIcon icon="fa-solid fa-circle-plus" size="xl" />
        </button>
      </div>
    </div>
    <div class="py-2 px-3 rounded" :class="{ 'opacity-50': status !== 'OPEN' }">
      <div class="mx-auto">
        <div
          v-if="!tasksFiltered.length"
          class="h-[calc(100vh-200px)] border-t pr-1.5 space-y-1 flex flex-col items-center justify-center"
        >
          <button
            title="Add"
            :disabled="status !== 'OPEN'"
            class="disabled:text-gray-200 text-teal-500 hover:text-teal-700 disabled:hover:text-gray-200 mr-3 enabled:cursor-pointer"
            @click="() => (formOppened = true)"
          >
            <FontAwesomeIcon icon="fa-solid fa-circle-plus" size="3x" />
          </button>
        </div>
        <ul
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-2 gap-4 text-gray-500 list-inside dark:text-gray-400"
        >
          <li
            v-for="task in tasksFiltered"
            :key="`${task.id}`"
            class="bg-white min-h-[200px] p-3 border rounded-lg shadow"
          >
            <div class="flex flex-col items-start h-full">
              <div class="flex flex-col w-full mb-2 h-full border-b">
                <div class="flex items-center justify-between text-lg border-b pb-1 mb-2">
                  <div class="flex items-center">
                    <h3 class="font-semibold max-w-[240px] truncate mr-2">
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
                  <button
                    :disabled="status !== 'OPEN'"
                    class="disabled:text-gray-200 text-red-500 hover:text-red-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
                    title="Remove"
                    @click="() => taskList.remove(task)"
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
                  <template v-if="!task.completed_at">
                    <button
                      v-if="!task.started_at && !task.paused_at"
                      :disabled="status !== 'OPEN'"
                      class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
                      title="Start"
                      @click="() => taskList.start(task)"
                    >
                      <FontAwesomeIcon icon="fa-regular fa-circle-play" size="xl"></FontAwesomeIcon>
                    </button>
                    <button
                      v-if="task.started_at && !task.paused_at"
                      :disabled="status !== 'OPEN'"
                      class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
                      title="Pause"
                      @click="() => taskList.pause(task)"
                    >
                      <FontAwesomeIcon
                        icon="fa-regular fa-circle-pause"
                        size="xl"
                      ></FontAwesomeIcon>
                    </button>
                    <button
                      v-if="task.started_at && task.paused_at"
                      :disabled="status !== 'OPEN'"
                      class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
                      title="Resume"
                      @click="() => taskList.resume(task)"
                    >
                      <FontAwesomeIcon icon="fa-regular fa-circle-play" size="xl"></FontAwesomeIcon>
                    </button>
                    <button
                      :disabled="status !== 'OPEN'"
                      class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
                      title="Complete"
                      @click="() => taskList.complete(task)"
                    >
                      <FontAwesomeIcon
                        icon="fa-solid fa-flag-checkered"
                        size="xl"
                      ></FontAwesomeIcon>
                    </button>
                  </template>
                  <template v-if="task.completed_at">
                    <button
                      :disabled="status !== 'OPEN'"
                      class="disabled:text-gray-200 text-green-500 hover:text-green-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
                      title="Restart"
                      @click="() => taskList.restart(task)"
                    >
                      <FontAwesomeIcon
                        icon="fa-solid fa-arrow-rotate-right"
                        size="xl"
                      ></FontAwesomeIcon>
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '@/hooks/auth';
import { useWebSocket } from '@/hooks/websocket';
import { useTasks, type Task } from '@/stores/tasks';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useDateFormat, useEventBus, useTimestamp } from '@vueuse/core';
import { ref, watch, computed } from 'vue';
const taskList = useTasks();
const taskName = ref('');
const filters = ref({
  sort_by: 'created_at',
  sort_dir: 'desc',
  status: 'all',
});

const { status } = useWebSocket();

const { on } = useEventBus<string>('default');

on((event: string, payload: any) => {
  if (event === 'list') {
    taskList.setList(payload.data?.tasks || []);
    taskList.sort(filters.value.sort_by, filters.value.sort_dir);
  }

  if (event === 'created') {
    taskList.addToList(payload.data?.task);
  }

  if (event === 'updated') {
    taskList.updateInList(payload.data?.task);
  }

  if (event === 'deleted') {
    taskList.deleteFromList(payload.data?.task);
  }
});

const auth = useAuth();
const filtersOpened = ref(true);
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
    tasks = tasks.filter((t) =>
      new RegExp(search.value.toLocaleLowerCase()).test(t.name.toLocaleLowerCase()),
    );
  }

  return tasks;
});

const timestamp = useTimestamp({ offset: 0 });

const currentAt = (task: Task) => {
  const totalElapsed = taskList.calculateElapsed(task);

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

watch(
  () => [filters.value.status, filters.value.sort_by, filters.value.sort_dir],
  (sortFilters) => {
    taskList.sort(sortFilters[1], sortFilters[2]);
  },
);
</script>
