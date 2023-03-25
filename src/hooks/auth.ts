import { useTasks } from '@/stores/tasks';
import { createGlobalState } from '@vueuse/core';
import { reactive } from 'vue';
import { useWebSocket } from './websocket';

export const useAuth = createGlobalState(() => {
  const state = reactive<{ isAuthenticated: boolean; userName: string | null }>({
    isAuthenticated: false,
    userName: null,
  });

  const { send } = useWebSocket();

  const authenticate = (token: string, username: string) => {
    state.isAuthenticated = true;
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
  };

  const register = async (username: string, password: string, secret: string) => {
    if (username && password) {
      send(
        JSON.stringify({
          type: 'register',
          data: {
            username,
            password,
            secret,
          },
        }),
      );
    } else {
      alert('Wrong credentials!');
    }
  };

  const login = async (username: string, password: string) => {
    if (username && password) {
      send(
        JSON.stringify({
          type: 'login',
          data: {
            username,
            password,
          },
        }),
      );
    } else {
      alert('Wrong credentials!');
    }
  };

  const logout = async () => {
    const sent = send(
      JSON.stringify({
        type: 'logout',
      }),
    );

    if (sent) {
      state.isAuthenticated = false;
      state.userName = null;

      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('task:filters');
      localStorage.removeItem('task:withDetails');

      useTasks().tasks = [];
    }
  };

  async function checkAuth() {
    if (!localStorage.getItem('token') && !localStorage.getItem('username')) {
      state.isAuthenticated = false;
      state.userName = null;

      return Promise.resolve(false);
    }

    state.isAuthenticated = true;
    state.userName = localStorage.getItem('username');
    return Promise.resolve(true);
  }

  return {
    authenticate,
    state,
    checkAuth,
    login,
    logout,
    register,
  };
});
