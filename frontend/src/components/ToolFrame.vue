<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  tool: { type: Object, required: true },
  query: { type: Object, default: () => ({}) },
});

// Use initial query for iframe src so that when the tool updates the URL via postMessage,
// we don't reload the iframe (we only update the address bar).
const initialQuery = ref({ ...props.query });
watch(
  () => props.tool.id,
  () => {
    initialQuery.value = { ...props.query };
  },
  { immediate: true }
);

const toolUrl = computed(() => {
  const base = '/tools/' + encodeURIComponent(props.tool.id) + '/';
  const path = base + 'index.html';
  const q = new URLSearchParams(initialQuery.value).toString();
  return q ? path + '?' + q : path;
});
</script>

<template>
  <div class="frame-wrap">
    <div class="frame-header">
      <h2 class="frame-title">{{ tool.name }}</h2>
      <p v-if="tool.description" class="frame-desc">{{ tool.description }}</p>
    </div>
    <iframe
      :src="toolUrl"
      :title="tool.name"
      class="tool-iframe"
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  </div>
</template>

<style scoped>
.frame-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.frame-header {
  flex-shrink: 0;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-elevated);
}

.frame-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.frame-desc {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.tool-iframe {
  flex: 1;
  width: 100%;
  border: none;
  min-height: 300px;
  background: #fff;
}
</style>
