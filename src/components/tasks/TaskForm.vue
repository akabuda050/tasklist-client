<template>
  <div
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
          @click="close"
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
          <form @submit.prevent="submit">
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
</template>
<script setup lang="ts">
import { useTasks } from '@/stores/tasks';
import { ref } from 'vue';

const taskStore = useTasks();
const emit = defineEmits(['close']);

const taskName = ref('');

const missingName = (messages: string) => {
  alert(messages);
};

const close = () => {
  taskName.value = '';

  emit('close');
};

const submit = () => {
  if (!taskName.value) {
    missingName('Enter task name!');
    return;
  }

  taskStore.add(taskName.value);
  close();
};
</script>
