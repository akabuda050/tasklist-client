import { reactive, type Ref } from 'vue';
import { useWebSocket, type WebSocketEvent } from './websocket';

const state = reactive({
  isAuthenticated: false,
});

export const useAuth = () => {
  const { connect, disconnect, send, isConnected } = useWebSocket();

  const register = async (username: string, password: string, secret: string) => {
    if (username && password) {
      connect(
        () => {
          send('register', {
            username,
            password,
            secret,
          });
        },
        (event: WebSocketEvent) => {
          console.log(event);
          if (event.type === 'registered') {
            if (event.data?.token) {
              state.isAuthenticated = true;
              localStorage.setItem('token', event.data?.token);

              send('list', {});
            }
          } else if (event.type === 'error') {
            state.isAuthenticated = false;
            localStorage.removeItem('token');

            alert(event.data.message);
          }
        },
      );
    } else {
      alert('Wrong credentials!');
    }
  };

  const login = async (username: string, password: string) => {
    if (username && password) {
      connect(
        () => {
          send('login', {
            username: username,
            password: password,
          });
        },
        (event: WebSocketEvent) => {
          if (event.type === 'loggedin') {
            if (event.data?.token) {
              state.isAuthenticated = true;
              localStorage.setItem('token', event.data?.token);

              send('list', {});
            }
          } else if (event.type === 'error') {
            state.isAuthenticated = false;
            localStorage.removeItem('token');

            alert(event.data.message);

            if (event.data.message === 'Please login!') {
              logout();
            }
          }
        },
      );
    } else {
      alert('Wrong credentials!');
    }
  };

  const logout = async () => {
    state.isAuthenticated = false;
    localStorage.removeItem('token');

    disconnect();
  };

  const checkAuth = (mounted: Ref) => {
    if (localStorage.getItem('token')) {
      if (!isConnected()) {
        connect(
          () => {
            state.isAuthenticated = true;
            mounted.value = true;
            send('list', {});
          },
          () => {},
        );
      }
    } else {
      mounted.value = true;
    }
  };

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
