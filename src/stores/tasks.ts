import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export type Task = {
  id: number;
  name: string;
  project?: string;
  created_at: number;

  started_at: number;
  current_at: number;
  completed_at: number;
  interval?: NodeJS.Timer;
};

export const useTasks = defineStore('tasks', () => {
  const tasks = ref<Task[]>([]);

  const username = ref('');

  function setUserName(name: string) {
    username.value = name;
  }

  function sort(sortFilter: string, sortDirection: string) {
    tasks.value.sort((a, b) => {
      if (sortFilter === 'started_at') {
        if (sortDirection == 'asc') {
          return a.started_at - b.started_at;
        } else {
          return b.started_at - a.started_at;
        }
      } else if (sortFilter === 'current_at') {
        if (sortDirection == 'asc') {
          return a.current_at - a.started_at - (b.current_at - b.started_at);
        } else {
          return b.current_at - b.started_at - (a.current_at - a.started_at);
        }
      } else if (sortFilter === 'created_at') {
        if (sortDirection == 'asc') {
          return a.created_at - b.created_at;
        } else {
          return b.created_at - a.created_at;
        }
      } else if (sortFilter === 'completed_at') {
        if (sortDirection == 'asc') {
          return a.completed_at - b.completed_at;
        } else {
          return b.completed_at - a.completed_at;
        }
      } else {
        return a.id - b.id;
      }
    });
  }

  function add(socket: WebSocket, name: string, project?: string, autostart?: boolean) {
    const task = {
      name: name,
    };

    socket.send(
      JSON.stringify({
        type: 'create',
        meta: {
          autostart,
        },
        task: task,
        username: username.value,
      }),
    );
  }

  function remove(socket: WebSocket, task: Task) {
    socket.send(
      JSON.stringify({
        type: 'delete',
        task: task,
        username: username.value,
      }),
    );
  }

  function start(socket: WebSocket, task: Task) {
    socket.send(
      JSON.stringify({
        type: 'start',
        task: task,
        username: username.value,
      }),
    );
  }

  function complete(socket: WebSocket, task: Task) {
    socket.send(
      JSON.stringify({
        type: 'complete',
        task: task,
        username: username.value,
      }),
    );
  }

  function setList(newList: Task[]) {
    tasks.value = newList;
  }

  function addToList(task: Task) {
    tasks.value.push(task);
  }

  function deleteFromList(task: Task) {
    tasks.value = tasks.value.filter((t) => t.id !== task.id);
  }

  function updateInList(newTask: Task) {
    tasks.value = tasks.value.map((t) => {
      if (t.id !== newTask.id) return t;

      return newTask;
    });
  }

  return {
    tasks,
    add,
    remove,
    start,
    complete,
    addToList,
    updateInList,
    deleteFromList,
    setList,
    sort,
    setUserName,
    username,
  };
});
