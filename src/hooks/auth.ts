import { useTasks } from '@/stores/tasks';
import { useEventBus } from '@vueuse/core';
import { reactive } from 'vue';
import { useWebSocket } from './websocket';

const state = reactive<{ isAuthenticated: boolean; userName: string | null }>({
  isAuthenticated: false,
  userName: null,
});
const { on } = useEventBus<string>('default');
const { send } = useWebSocket();

on((event: string, payload: any) => {
  if (event === 'loggedin' && payload?.data?.token) {
    state.isAuthenticated = true;

    if (payload?.data?.token) {
      localStorage.setItem('token', payload?.data?.token);
    }
    if (payload?.data?.username) {
      localStorage.setItem('username', payload?.data?.username);
      state.userName = payload?.data?.username;
    }

    send(
      JSON.stringify({
        type: 'list',
        data: {
          token: localStorage.getItem('token'),
        },
      }),
    );
  }
});

on((event: string, payload: any) => {
  if (event === 'registered' && payload?.data?.token) {
    state.isAuthenticated = true;
    if (payload?.data?.token) {
      localStorage.setItem('token', payload?.data?.token);
    }
    if (payload?.data?.username) {
      localStorage.setItem('username', payload?.data?.username);
      state.userName = payload?.data?.username;
    }

    send(
      JSON.stringify({
        type: 'list',
        data: {
          token: localStorage.getItem('token'),
        },
      }),
    );
  }
});

on((event: string) => {
  if (event === 'loggedout') {
    state.isAuthenticated = false;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    state.userName = null;

    useTasks().tasks = [];
  }
});

export const useAuth = () => {
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
    state,
    checkAuth,
    login,
    logout,
    register,
  };
};
