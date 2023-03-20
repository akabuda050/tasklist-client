import { useTasks } from '@/stores/tasks';
import { useEventBus } from '@vueuse/core';
import { reactive } from 'vue';
import { useWebSocket } from './websocket';

const state = reactive({
  isAuthenticated: false,
});
const { on } = useEventBus<string>('default');
const { send } = useWebSocket();

on((event: string, payload: any) => {
  if (event === 'loggedin' && payload?.data?.token) {
    state.isAuthenticated = true;
    localStorage.setItem('token', payload?.data?.token);

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
    localStorage.setItem('token', payload?.data?.token);

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
      localStorage.removeItem('token');
      useTasks().tasks = [];
    }
  };

  async function checkAuth() {
    if (!localStorage.getItem('token')) {
      state.isAuthenticated = false;
      return Promise.resolve(false);
    }

    state.isAuthenticated = true;
    return Promise.resolve(true);
  }

  const isAuthenticated = () => {
    return state.isAuthenticated;
  };

  return {
    isAuthenticated,
    checkAuth,
    login,
    logout,
    register,
  };
};
