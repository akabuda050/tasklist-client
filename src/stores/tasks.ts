import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useWebSocket } from '@/hooks/websocket';

export type Task = {
  id: number;
  name: string;
  project?: string;
  created_at: number;

  started_at: number;
  current_at: number;
  completed_at: number;
};

export const useTasks = defineStore('tasks', () => {
  const webSocket = useWebSocket();

  const tasks = ref<Task[]>([]);

  function sort(sortFilter: string, sortDirection: string) {
    tasks.value.sort((a, b) => {
      if (sortFilter === 'started_at') {
        if (sortDirection == 'asc') {
          return a.started_at - b.started_at;
        } else {
          return b.started_at - a.started_at;
        }
      } else if (sortFilter === 'current_at') {
        const timestampA = a.current_at;
        const timestampB = b.current_at;

        if (sortDirection == 'asc') {
          return timestampA - a.started_at - (timestampB - b.started_at);
        } else {
          return timestampB - b.started_at - (timestampA - a.started_at);
        }
      } else if (sortFilter === 'completed_at') {
        if (sortDirection == 'asc') {
          return a.completed_at - b.completed_at;
        } else {
          return b.completed_at - a.completed_at;
        }
      } else {
        if (sortDirection == 'asc') {
          return a.created_at - b.created_at;
        } else {
          return b.created_at - a.created_at;
        }
      }
    });
  }

  function add(name: string, project?: string) {
    const task = {
      name: name,
      project: project,
    };

    webSocket.send('create', {
      task: task,
    });
  }

  function remove(task: Task) {
    webSocket.send('delete', {
      task: task,
    });
  }

  function start(task: Task) {
    webSocket.send('start', {
      task: task,
    });
  }

  function complete(task: Task) {
    webSocket.send('complete', {
      task: task,
    });
  }

  function setList(newList: Task[]) {
    tasks.value = newList;
  }

  function addToList(task: Task) {
    const idx = tasks.value.findIndex((t) => t.id === task.id);

    if (idx === -1) {
      tasks.value.push(task);
    } else {
      tasks.value[idx] = task;
    }
  }

  function deleteFromList(task: Task) {
    tasks.value = tasks.value.filter((t) => t.id !== task.id);
  }

  function updateInList(task: Task) {
    addToList(task);
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
  };
});
