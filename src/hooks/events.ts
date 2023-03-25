import { useEventBus as createEventBus } from '@vueuse/core';

export const useDefaultEventBus = () => createEventBus<string>('default');
export const useMessagesEventBus = () => createEventBus<string>('messages');
