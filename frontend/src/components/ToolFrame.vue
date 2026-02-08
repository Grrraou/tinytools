<script setup>
import { computed } from 'vue';

const props = defineProps({
  tool: { type: Object, required: true },
});

const toolUrl = computed(() => {
  const base = '/tools/' + encodeURIComponent(props.tool.id) + '/';
  return base + 'index.html';
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
