<template>
  <div class="flex items-center justify-center h-screen">
    <div class="flex flex-col mx-auto justify-start">
      <div class="flex items-center justify-between py-2 px-1">
        <h1 class="text-lg font-bold mr-2">{{ !showRegistration ? 'Login' : 'Register' }}</h1>
        <font-awesome-icon
            icon="fa-solid fa-wifi"
            :beat="status === 'CONNECTING'"
          :class="{
            'text-yellow-400': status === 'CONNECTING',
            'text-green-400': status === 'OPEN',
            'text-red-500': status === 'CLOSED',
          }"
        />
      </div>
      <form
        class="min-w-[350px] bg-white shadow py-5 px-6 rounded-lg"
        @submit.prevent="
          () => {
            if (showRegistration) {
              signUp();
            } else {
              signIn();
            }
          }
        "
      >
        <div>
          <label for="username" class="block text-sm font-medium text-slate-700">Username</label>
          <div class="mt-1 mb-2">
            <input
              type="text"
              name="username"
              id="username"
              class="px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-teal-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
              v-model="username"
            />
          </div>
          <label for="username" class="block text-sm font-medium text-slate-700">Password</label>
          <div class="mt-1 mb-2">
            <input
              type="password"
              name="password"
              id="password"
              class="px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-teal-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
              v-model="password"
            />
          </div>
          <template v-if="showRegistration">
            <label for="secret" class="block text-sm font-medium text-slate-700">Secret</label>
            <div class="mt-1 mb-2">
              <input
                type="password"
                name="secret"
                id="secret"
                class="px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 focus:outline-none focus:border-teal-500 focus:ring-teal-500 block w-full rounded-md sm:text-sm focus:ring-1 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 disabled:shadow-none"
                v-model="secret"
              />
            </div>
          </template>
        </div>
        <div class="flex justify-between mt-6">
          <button
            type="button"
            @click.prevent="
              () => {
                showRegistration = !showRegistration;
              }
            "
            class="text-sm leading-5 rounded-md font-semibold text-black"
          >
            {{ showRegistration ? 'Login' : 'Register' }}
          </button>
          <button
            type="submit"
            :disabled="status !== 'OPEN'"
            :class="{ 'disabled:bg-gray-200': status !== 'OPEN' }"
            class="bg-teal-500 hover:bg-teal-700 px-2 py-1 text-sm leading-5 rounded-md font-semibold text-white"
          >
            {{ showRegistration ? 'Sign Up' : 'Sign In' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '@/hooks/auth';
import { useWebSocket } from '@/hooks/websocket';
import { ref } from 'vue';
const auth = useAuth();
const showRegistration = ref(false);
const { status } = useWebSocket();

const username = ref('');
const password = ref('');
const secret = ref('');

const signIn = () => {
  auth.login(username.value, password.value);

  username.value = '';
  password.value = '';
};

const signUp = () => {
  auth.register(username.value, password.value, secret.value);

  username.value = '';
  password.value = '';
  secret.value = '';
};
</script>
