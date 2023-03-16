import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import TaskList from '../TaskList.vue';

describe('TaskList', () => {
  it('renders properly', () => {
    const wrapper = mount(TaskList);
    expect(wrapper.exists()).toBe(true);
  });
});
