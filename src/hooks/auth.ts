import { useTasks } from '@/stores/tasks';
import { useEventBus } from '@vueuse/core';
import { reactive } from 'vue';
import { useWebSocket } from './websocket';

const state = reactive({
  isAuthenticated: false,
});

export const useAuth = () => {
  const { send } = useWebSocket();
  const { on } = useEventBus<string>('default');

  const register = async (username: string, password: string, secret: string) => {
    if (username && password) {
      on((event: string, payload: any) => {
        if (event === 'registered' && payload?.data?.token) {
          state.isAuthenticated = true;
          localStorage.setItem('token', payload?.data?.token);

          send(
            JSON.stringify({
              type: 'list',
              data: {},
            }),
          );
        }
      });

      on((event: string, payload: any) => {
        if (event === 'error' && payload?.data?.error === 'registration') {
          alert(payload?.data?.message);
        }
      });

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
      on((event: string, payload: any) => {
        if (event === 'loggedin' && payload?.data?.token) {
          state.isAuthenticated = true;
          localStorage.setItem('token', payload?.data?.token);

          send(
            JSON.stringify({
              type: 'list',
              data: {},
            }),
          );
        }
      });

      on((event: string, payload: any) => {
        if (event === 'error' && payload?.data?.error === 'login') {
          alert(payload?.data?.message);
        }
      });

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
    on((event: string) => {
      if (event === 'loggedout') {
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        useTasks().tasks = [];
      }
    });

    on((event: string, payload: any) => {
      if (event === 'error' && payload?.data?.error === 'logout') {
        alert(payload?.data?.message);
      }
    });

    send(
      JSON.stringify({
        type: 'logout',
        data: {},
      }),
    );
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
