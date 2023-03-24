import { describe, it, expect, beforeAll } from 'vitest';
import { mount } from '@vue/test-utils';

import TaskCard from '../tasks/TaskCard.vue';
import { createPinia, setActivePinia } from 'pinia';

describe('TaskCard', () => {
  it('renders properly', () => {
    setActivePinia(createPinia());

    const wrapper = mount(TaskCard, {
      global: {
        stubs: ['FontAwesomeIcon'],
      },
      props: {
        task: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'task1',
          project: undefined,
          created_at: Date.now(),
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
    expect(wrapper.find('h3').text()).toEqual('task1');
  });
});
