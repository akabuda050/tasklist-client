import { useTasks } from '@/stores/tasks';
import { reactive } from 'vue';
import { useWebSocket } from './websocket';

const state = reactive({
  isAuthenticated: false,
});

export const useAuth = () => {
  const { send, subscribe, unsubscribe, parseEvent, disconnect } = useWebSocket();

  function handleRegistration(message: MessageEvent) {
    const event = parseEvent(message);
    unsubscribe(handleRegistration);

    if (event.type === 'registered') {
      if (event.data?.token) {
        state.isAuthenticated = true;
        localStorage.setItem('token', event.data?.token);

        send('list', {});
      }
    } else if (event.type === 'error') {
      if (event.data.error === 'registration') {
        alert(event.data.message);
      }
    }
  }

  const register = async (username: string, password: string, secret: string) => {
    if (username && password) {
      subscribe(handleRegistration);

      send('register', {
        username,
        password,
        secret,
      });
    } else {
      alert('Wrong credentials!');
    }
  };

  function handleLogin(message: MessageEvent) {
    unsubscribe(handleLogin);

    const event = parseEvent(message);

    if (event.type === 'loggedin') {
      if (event.data?.token) {
        state.isAuthenticated = true;
        localStorage.setItem('token', event.data?.token);

        send('list', {});
      }
    } else if (event.type === 'error') {
      if (event.data.error === 'login') {
        alert(event.data.message);
      }
    }
  }

  const login = async (username: string, password: string) => {
    if (username && password) {
      subscribe(handleLogin);

      send('login', {
        username: username,
        password: password,
      });
    } else {
      alert('Wrong credentials!');
    }
  };

  function handleLogout(message: MessageEvent) {
    unsubscribe(handleLogout);
    const event = parseEvent(message);

    if (event.type === 'loggedout') {
      state.isAuthenticated = false;
      localStorage.removeItem('token');

      unsubscribe(handleRegistration);
      unsubscribe(handleLogin);

      useTasks().tasks = [];
    } else if (event.type === 'error') {
      if (event.data.error === 'logout') {
        alert(event.data.message);
      }
    }
  }

  const logout = async () => {
    subscribe(handleLogout);
    send('logout', {});
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
