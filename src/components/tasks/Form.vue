<template>
  <div>
    {{ internalValueLabel }}

    <button @click="addValue">Add</button>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
const $emit = defineEmits(['update-internal-value']);

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
});

const internalValue = ref(props.value);
watch(
  () => props.value,
  (newVal) => {
    internalValue.value = newVal;
  },
);

const internalValueLabel = computed(() => {
  return `My current value: ${internalValue.value}`;
});

const addValue = () => {
  internalValue.value++;
  $emit('update-internal-value', internalValue.value);
};
</script>
