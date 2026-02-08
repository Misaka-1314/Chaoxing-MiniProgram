<template>
  <div ref="turnstileElement"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineExpose } from 'vue';

const props = defineProps({
  siteKey: { type: String, required: true },
  modelValue: { type: String, default: '' },
  size: { type: String, default: 'flexible' },
});

const emit = defineEmits(['update:modelValue', 'error', 'expired']);

const turnstileElement = ref(null);
const widgetId = ref(undefined);

/**
* 重置验证状态
*/
const reset = () => {
  if (window.turnstile && widgetId.value) {
    emit('update:modelValue', '');
    window.turnstile.reset(widgetId.value);
  }
};

defineExpose({ reset });


const render = () => {
  if (window.turnstile && turnstileElement.value) {
    widgetId.value = window.turnstile.render(turnstileElement.value, {
      sitekey: props.siteKey,
      size: props.size,
      callback: (token) => {
        emit('update:modelValue', token);
      },
      'error-callback': (err) => emit('error', err),
      'expired-callback': () => {
        emit('update:modelValue', '');
        emit('expired');
      },
    });
  }
};

onMounted(() => {
  if (!window.turnstile) {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
  } else {
    render();
  }
});

onBeforeUnmount(() => {
  if (widgetId.value && window.turnstile) {
    window.turnstile.remove(widgetId.value);
  }
});
</script>