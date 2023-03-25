import { describe, it, expect, beforeAll, vi, type Task } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import TaskCard from '../tasks/TaskCard.vue';
import { createPinia, setActivePinia } from 'pinia';
import { WebSocket as WS, Server } from 'mock-socket';
import { useWebSocket } from '@/hooks/websocket';
import { createTestingPinia } from '@pinia/testing';
import { useEventBus } from '@vueuse/core';
const { emit } = useEventBus<string>('default');

describe('TaskCard', () => {
  beforeAll(() => {
    // Init needed modules, etc.
  });

  it('renders pending task properly', async () => {
    const fakeURL = 'ws://localhost:8080';
    const mockServer = new Server(fakeURL);

    // Set current date to specific date so we can easely test dates in our component.
    mockServer.on('connection', (socket) => {
      socket.on('message', (data) => {
        console.log(data);
        socket.send(
          JSON.stringify({
            type: 'updated',
            task: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'task1',
              project: undefined,
              created_at: new Date('2023-03-24 09:00:00').getTime(),
              started_at: new Date('2023-03-24 09:30:00').getTime(),
              paused_at: null,
              completed_at: null,
              elapsed: 0,
              priority: 'top',
            },
          }),
        );
      });
    });

    window.WebSocket = WS;

    const { open } = useWebSocket();

    open('ws://localhost:8080', {
      onMessage: (ws: WebSocket, messageEvent: MessageEvent) => {
        console.log('asdddddddddddddddddd');
        const event = JSON.parse(messageEvent.data);

        if (event?.type) {
          emit(event.type, event);
        }
      },
    });

    const wrapper = mount(TaskCard, {
      global: {
        // This array contains all components that should be used in our component but not needed in tests.
        stubs: ['FontAwesomeIcon'],
        plugins: [
          createTestingPinia({
            stubActions: true,
            createSpy: vi.fn,
            initialState: {
              tasks: {
                tasks: [
                  {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'task1',
                    project: undefined,
                    created_at: new Date('2023-03-24 09:00:00').getTime(),
                    started_at: null,
                    paused_at: null,
                    completed_at: null,
                    elapsed: 0,
                    priority: 'top',
                  },
                ],
              },
            },
          }),
        ],
      },
      props: {
        task: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'task1',
          project: undefined,
          created_at: new Date('2023-03-24 09:00:00').getTime(),
          started_at: null,
          paused_at: null,
          completed_at: null,
          elapsed: 0,
          priority: 'top',
        },
        withDetails: true,
      },
    });

    expect(wrapper.exists()).toBe(true);

    // Task header.
    expect(wrapper.find('[data-test="name"]').text()).toEqual('task1');
    expect(wrapper.find('[data-test="name-input"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="remove-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="remove-button"]').attributes('disabled')).toStrictEqual('');
    expect(wrapper.find('[data-test="status-color"]').classes()).toContain('bg-gray-400');

    // Task details.
    expect(wrapper.find('[data-test="details"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="created-at"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="created-at"]').text()).toStrictEqual('03/24/23 09:00:00 AM');

    expect(wrapper.find('[data-test="started-at"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="started-at"]').text()).toStrictEqual('-');

    expect(wrapper.find('[data-test="completed-at"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="completed-at"]').text()).toStrictEqual('-');

    // Task footer.
    expect(wrapper.find('[data-test="priority"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="priority"]').classes()).toContain('capitalize');
    expect(wrapper.find('[data-test="priority-label"]').text()).toStrictEqual('top');
    expect(wrapper.find('[data-test="priority-select"]').exists()).toBe(false);

    expect(wrapper.find('[data-test="elapsed-time"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="elapsed-time"]').text()).toStrictEqual('0s');

    expect(wrapper.find('[data-test="start-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="pause-button"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="resume-button"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="complete-button"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="restart-button"]').exists()).toBe(false);

    await wrapper.find('[data-test="start-button"]').trigger('click');
    await flushPromises();
    expect(wrapper.find('[data-test="started-at"]').text()).toStrictEqual('03/24/23 09:30:00 AM');
  });
});
