import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useWebSocket } from '@/hooks/websocket';
import { useTimestamp } from '@vueuse/core';

export type Task = {
  id: number;
  name: string;
  project?: string;
  created_at: number;

  started_at: number;
  completed_at: number;
};

const timestamp = useTimestamp();

export const useTasks = defineStore('tasks', () => {
  const { send } = useWebSocket();

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
        const timestampA = a.completed_at || timestamp.value;
        const timestampB = a.completed_at || timestamp.value;

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

    send(
      JSON.stringify({
        type: 'create',
        data: {
          task: task,
          token: localStorage.getItem('token'),
        },
      }),
    );
  }

  function remove(task: Task) {
    send(
      JSON.stringify({
        type: 'delete',
        data: {
          task: task,
          token: localStorage.getItem('token'),
        },
      }),
    );
  }

  function start(task: Task) {
    send(
      JSON.stringify({
        type: 'start',
        data: {
          task: task,
          token: localStorage.getItem('token'),
        },
      }),
    );
  }

  function complete(task: Task) {
    send(
      JSON.stringify({
        type: 'complete',
        data: {
          task: task,
          token: localStorage.getItem('token'),
        },
      }),
    );
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
