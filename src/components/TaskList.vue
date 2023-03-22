<template>
  <div class="h-full mx-auto relative">
    <div class="sticky top-0 bg-white shadow flex flex-col rounded border-b z-10 py-2 px-4">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold max-w-[200px] truncate mr-2">{{
            authState.userName
          }}</span>
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
            title="Filter"
            class="disabled:text-gray-200 text-teal-500 hover:text-teal-700 disabled:hover:text-gray-200 enabled:cursor-pointer"
            @click="() => (filtersOpened = !filtersOpened)"
          >
            <FontAwesomeIcon
              :icon="`fa-solid ${filtersOpened ? 'fa-filter-circle-xmark' : 'fa-filter'}`"
              size="xl"
            />
          </button>
          <button
            :disabled="disabled"
            title="Logout"
            class="disabled:text-gray-500 text-teal-500 enabled:hover:text-teal-700 p-1 ml-4 border-2 disabled:border-gray-500 border-teal-500 hover:border-teal-700 rounded-[5px]"
            @click="() => logout()"
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
            <option value="priority">Sort by priority</option>
            <option value="created_at">Sort by created</option>
            <option value="started_at">Sort by started</option>
            <option value="completed_at">Sort by completed</option>
            <option value="current_at">Sort by time taken</option>
          </select>

          <button
            :disabled="disabled"
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
          :disabled="disabled"
          class="disabled:text-gray-200 text-teal-500 hover:text-teal-700 disabled:hover:text-gray-200 mr-2 enabled:cursor-pointer"
          @click="
            () => {
              formOppened = true;
            }
          "
        >
          <FontAwesomeIcon icon="fa-solid fa-circle-plus" size="xl" />
        </button>
      </div>
    </div>
    <div class="py-2 px-3 rounded" :class="{ 'opacity-50': disabled }">
      <div class="mx-auto">
        <div
          v-if="!tasksFiltered.length"
          class="h-[calc(100vh-200px)] border-t pr-1.5 space-y-1 flex flex-col items-center justify-center"
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
          <TaskCard v-for="task in tasksFiltered" :key="`${task.id}`" :task="task" />
        </div>
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
import { ref, watch, computed } from 'vue';
import TaskCard from './tasks/TaskCard.vue';
import TaskForm from './tasks/TaskForm.vue';

const { on } = useEventBus<string>('default');
const { state: authState, logout } = useAuth();
const { status } = useWebSocket();
const taskStore = useTasks();

const disabled = computed(() => {
  return status.value !== 'OPEN';
});

const search = ref('');
const filtersOpened = ref(true);
const formOppened = ref(false);
const filters = ref({
  sort_by: 'priority',
  sort_dir: 'desc',
  status: 'all',
});

on((event: string, payload: any) => {
  if (event === 'list') {
    taskStore.setList(payload.data?.tasks || []);
    taskStore.sort(filters.value.sort_by, filters.value.sort_dir);
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

watch(
  () => [filters.value.status, filters.value.sort_by, filters.value.sort_dir],
  (sortFilters) => {
    taskStore.sort(sortFilters[1], sortFilters[2]);
  },
);
</script>
