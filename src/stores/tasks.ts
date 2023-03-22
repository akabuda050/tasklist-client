import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useWebSocket } from '@/hooks/websocket';
import { useTimestamp } from '@vueuse/core';

export type Task = {
  id: number;
  name: string;
  project?: string;
  created_at: number;

  started_at: number | null;
  paused_at: number | null;
  completed_at: number | null;

  elapsed: number;

  priority: string;
};

export const priorityMap: {
  [key: Task['priority']]: {
    colorsClasses: string;
    order: number;
  };
} = {
  low: {
    colorsClasses: 'bg-emerald-200',
    order: 1,
  },
  medium: {
    colorsClasses: 'bg-yellow-200',
    order: 2,
  },
  hight: {
    colorsClasses: 'bg-orange-400 text-white',
    order: 3,
  },
  top: {
    colorsClasses: 'bg-red-600 text-white',
    order: 4,
  },
};

const timestamp = useTimestamp({ offset: 0 });
const { send } = useWebSocket();

export const useTasks = defineStore('tasks', () => {
  const tasks = ref<Task[]>([]);

  function calculateElapsed(task: Task) {
    const { started_at, completed_at, paused_at, elapsed } = task;
    let totalElapsed = elapsed;
    let now = timestamp.value;

    if (!started_at) return 0;

    if (paused_at) {
      totalElapsed = paused_at - started_at;
      now = paused_at;
    }

    if (completed_at) {
      totalElapsed = elapsed;
    } else {
      totalElapsed = now - elapsed - started_at;
    }

    return totalElapsed;
  }

  function sort(sortFilter: string, sortDirection: string) {
    tasks.value.sort((a, b) => {
      if (sortFilter === 'started_at') {
        if (sortDirection == 'asc') {
          return (a.started_at || 0) - (b.started_at || 0);
        } else {
          return (b.started_at || 0) - (a.started_at || 0);
        }
      } else if (sortFilter === 'current_at') {
        const elapsedA = calculateElapsed(a);
        const elapsedB = calculateElapsed(b);

        if (sortDirection == 'asc') {
          return elapsedA - elapsedB;
        } else {
          return elapsedB - elapsedA;
        }
      } else if (sortFilter === 'completed_at') {
        if (sortDirection == 'asc') {
          return (a.completed_at || 0) - (b.completed_at || 0);
        } else {
          return (b.completed_at || 0) - (a.completed_at || 0);
        }
      } else if (sortFilter === 'priority') {
        if (sortDirection == 'asc') {
          return (
            (priorityMap[a.priority]?.order || 1) - (priorityMap[b.priority]?.order || 1) ||
            a.created_at - b.created_at
          );
        } else {
          return (
            (priorityMap[b.priority]?.order || 1) - (priorityMap[a.priority]?.order || 1) ||
            b.created_at - a.created_at
          );
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

  function add(name: string, priority: string, project?: string) {
    const task = {
      name: name,
      project: project,
      priority,
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

  function updatePriority(id: Task['id'], priority: Task['priority']) {
    send(
      JSON.stringify({
        type: 'updatePriority',
        data: {
          task: {
            id,
            priority,
          },
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
          task: {
            id: task.id,
          },
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
          task: {
            id: task.id,
          },
          token: localStorage.getItem('token'),
        },
      }),
    );
  }

  function pause(task: Task) {
    send(
      JSON.stringify({
        type: 'pause',
        data: {
          task: {
            id: task.id,
          },
          token: localStorage.getItem('token'),
        },
      }),
    );
  }

  function resume(task: Task) {
    send(
      JSON.stringify({
        type: 'resume',
        data: {
          task: {
            id: task.id,
          },
          token: localStorage.getItem('token'),
        },
      }),
    );
  }

  function restart(task: Task) {
    send(
      JSON.stringify({
        type: 'restart',
        data: {
          task: {
            id: task.id,
          },
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
          task: {
            id: task.id,
          },
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
      tasks.value.unshift(task);
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
    updatePriority,
    remove,
    start,
    pause,
    resume,
    restart,
    complete,
    addToList,
    updateInList,
    deleteFromList,
    setList,
    sort,
    calculateElapsed,
  };
});
