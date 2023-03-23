<template>
  <div class="h-full mx-auto relative">
    <div class="sticky top-0 bg-white shadow flex flex-col rounded border-b z-10 py-2 px-4">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-between">
            <span class="text-lg font-semibold max-w-[200px] truncate mr-2">{{
              authState.userName
            }}</span>
            <span class="self-start text-xs font-semibold max-w-[200px] truncate mr-2">{{
              tasksFiltered.length
            }}</span>
          </div>

          <FontAwesomeIcon
            icon="fa-solid fa-wifi"
            :beat="status === 'CONNECTING'"
            size="1x"
            :class="{
              'text-yellow-400': status === 'CONNECTING',
              'text-green-400': status === 'OPEN',
              'text-red-500': status === 'CLOSED',
            }"
          />
        </div>
        <div class="flex">
          <button
            title="Reset filters"
            class="text-teal-500 enabled:hover:text-teal-700 p-1 border-2 border-teal-500 hover:border-teal-700 rounded-[5px]"
            @click="() => resetFilters()"
          >
            <FontAwesomeIcon :icon="`fa-solid fa-filter-circle-xmark`" size="xl" />
          </button>
          <button
            :disabled="disabled"
            title="Logout"
            class="disabled:text-gray-500 text-teal-500 enabled:hover:text-teal-700 p-1 mx-2 border-2 disabled:border-gray-500 border-teal-500 hover:border-teal-700 rounded-[5px]"
            @click="() => logout()"
          >
            <FontAwesomeIcon icon="fa-solid fa-person-running" size="xl" />
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between flex-row gap-1 mb-2">
        <div class="flex items-center gap-1">
          <div class="flex flex-col items-start">
            <label for="status" class="text-sm font-medium text-slate-700">Status:</label>
            <select
              id="status"
              class="p-1 border-2 border-teal-500 hover:border-teal-700 rounded-[5px] appereance-none"
              v-model="filters.status"
            >
              <option value="all">All</option>
              <option value="pending">Unstarted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div class="flex flex-col items-start">
            <label for="priority" class="text-sm font-medium text-slate-700">Priority:</label>
            <select
              id="priority"
              class="p-1 border-2 border-teal-500 hover:border-teal-700 rounded-[5px] appereance-none"
              v-model="filters.priority"
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="hight">Hight</option>
              <option value="top">Top</option>
            </select>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <div class="flex flex-col items-start">
            <label for="sort" class="text-sm font-medium text-slate-700">Sort by:</label>
            <div class="flex items-center gap-1">
              <select
                id="sort"
                class="p-1 border-2 border-teal-500 hover:border-teal-700 rounded-[5px] appereance-none"
                v-model="filters.sort_by"
              >
                <option value="priority">Priority</option>
                <option value="created_at">Created</option>
                <option value="started_at">Started</option>
                <option value="completed_at">Completed</option>
                <option value="current_at">Time taken</option>
              </select>
              <button
                :disabled="disabled"
                title="Logout"
                class="self-end disabled:text-gray-500 text-teal-500 enabled:hover:text-teal-700 p-1 border-2 border-teal-500 hover:border-teal-700 rounded-[5px]"
                @click="() => (filters.sort_dir = filters.sort_dir === 'asc' ? 'desc' : 'asc')"
              >
                <FontAwesomeIcon
                  :icon="`fa-solid ${
                    filters.sort_dir === 'asc'
                      ? 'fa-arrow-up-wide-short'
                      : 'fa-arrow-down-wide-short'
                  }`"
                  size="xl"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-1 mb-2">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Enter task name to search"
          class="p-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-teal-500 block w-full rounded-md sm:text-sm invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
          v-model="search"
        />

        <button
          title="Add"
          :disabled="disabled"
          class="disabled:text-gray-200 text-teal-500 hover:text-teal-700 disabled:hover:text-gray-200 px-2 enabled:cursor-pointer border-r"
          @click="
            () => {
              formOppened = true;
            }
          "
        >
          <FontAwesomeIcon icon="fa-solid fa-circle-plus" size="xl" />
        </button>

        <button
          :title="`${withDetails ? 'Less info' : 'More info'}`"
          class="mx-1 disabled:text-gray-200 text-teal-500 hover:text-teal-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
          @click="() => toggleDetails()"
        >
          <FontAwesomeIcon
            :icon="`fa-solid ${withDetails ? 'fa-angles-down' : 'fa-angles-up '}`"
            size="xl"
          />
        </button>
      </div>
    </div>
    <div class="min-h-[calc(100vh_-_200px)] py-2 px-3 rounded" :class="{ 'opacity-50': disabled }">
      <div
        v-if="!tasksFiltered.length"
        class="min-h-[calc(100vh_-_200px)] pr-1.5 space-y-1 flex flex-col items-center justify-center"
      >
        <button
          title="Add"
          :disabled="disabled"
          class="disabled:text-gray-200 text-teal-500 hover:text-teal-700 disabled:hover:text-gray-200 mr-3 enabled:cursor-pointer"
          @click="
            () => {
              formOppened = true;
            }
          "
        >
          <FontAwesomeIcon icon="fa-solid fa-circle-plus" size="3x" />
        </button>
      </div>
      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-2 gap-4 text-gray-500 list-inside dark:text-gray-400"
      >
        <TaskCard
          v-for="task in tasksFiltered"
          :key="`${task.id}`"
          :task="task"
          :with-details="withDetails"
        />
      </div>
    </div>

    <TaskForm
      v-if="formOppened"
      @close="
        () => {
          formOppened = false;
        }
      "
    />
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '@/hooks/auth';
import { useWebSocket } from '@/hooks/websocket';
import { useTasks } from '@/stores/tasks';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useEventBus } from '@vueuse/core';
import { ref, watch, computed, reactive } from 'vue';
import TaskCard from './tasks/TaskCard.vue';
import TaskForm from './tasks/TaskForm.vue';

type Filters = {
  status: string;
  sort_by: string;
  sort_dir: string;
  priority: string;
};

const { on } = useEventBus<string>('default');
const { state: authState, logout } = useAuth();
const { status } = useWebSocket();
const taskStore = useTasks();

const disabled = computed(() => {
  return status.value !== 'OPEN';
});

const search = ref('');
const formOppened = ref(false);

const defailtFilters: Filters = {
  sort_by: 'priority',
  sort_dir: 'desc',
  status: 'all',
  priority: 'all',
};

const localStorageFiltersState = localStorage.getItem('task:filters');
const filters = reactive<Filters>(
  localStorageFiltersState ? (JSON.parse(localStorageFiltersState) as Filters) : defailtFilters,
);

const resetFilters = () => {
  filters.status = defailtFilters.status;
  filters.sort_by = defailtFilters.sort_by;
  filters.sort_dir = defailtFilters.sort_dir;
  filters.priority = defailtFilters.priority;
};

on((event: string, payload: any) => {
  if (event === 'list') {
    taskStore.setList(payload.data?.tasks || []);
    taskStore.sort(filters.sort_by, filters.sort_dir);
  }

  if (event === 'created') {
    taskStore.addToList(payload.data?.task);
  }

  if (event === 'updated') {
    taskStore.updateInList(payload.data?.task);
  }

  if (event === 'deleted') {
    taskStore.deleteFromList(payload.data?.task);
  }
});

const tasksFiltered = computed(() => {
  let tasks = taskStore.tasks.filter((t) => {
    if (filters.status === 'in_progress') {
      return t.started_at && !t.completed_at;
    } else if (filters.status === 'completed') {
      return t.started_at && t.completed_at;
    } else if (filters.status === 'pending') {
      return !t.started_at && !t.completed_at;
    }

    return t.id;
  });

  if (filters.priority !== 'all') {
    tasks = tasks.filter((t) => t.priority === filters.priority);
  }

  if (search.value) {
    tasks = tasks.filter((t) =>
      new RegExp(search.value.toLocaleLowerCase()).test(t.name.toLocaleLowerCase()),
    );
  }

  return tasks;
});

watch(
  () => [filters.status, filters.sort_by, filters.sort_dir, filters.priority],
  (sortFilters) => {
    localStorage.setItem(
      'task:filters',
      JSON.stringify({
        status: sortFilters[0],
        sort_by: sortFilters[1],
        sort_dir: sortFilters[2],
        priority: sortFilters[3],
      }),
    );

    taskStore.sort(sortFilters[1], sortFilters[2]);
  },
);

const withDetails = ref(localStorage.getItem('task:withDetails') === 'true');
const toggleDetails = () => {
  withDetails.value = !withDetails.value;

  localStorage.setItem('task:withDetails', withDetails.value ? 'true' : 'false');
};
</script>
