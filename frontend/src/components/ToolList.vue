<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  tools: { type: Array, default: () => [] },
  selectedTool: { type: Object, default: null },
  selectedCategory: { type: String, default: null },
});

const emit = defineEmits(['select-tool', 'select-category']);
</script>

<template>
  <div class="tool-list">
    <nav class="categories" aria-label="Tool categories">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        class="category-btn"
        :class="{ active: selectedCategory === cat }"
        @click="emit('select-category', cat)"
      >
        {{ cat }}
      </button>
    </nav>
    <ul class="tools" role="list">
      <li v-for="tool in tools" :key="tool.id" class="tool-item">
        <button
          type="button"
          class="tool-btn"
          :class="{ active: selectedTool?.id === tool.id }"
          @click="emit('select-tool', tool)"
        >
          <span class="tool-name">{{ tool.name }}</span>
          <span v-if="tool.description" class="tool-desc">{{ tool.description }}</span>
        </button>
      </li>
    </ul>
    <p v-if="tools.length === 0" class="no-results">No tools match your search.</p>
  </div>
</template>

<style scoped>
.tool-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0 0.75rem 0.5rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.5rem;
}

.category-btn {
  padding: 0.35rem 0.6rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
}

.category-btn:hover {
  color: var(--text);
  border-color: var(--text-muted);
}

.category-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.tools {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tool-item {
  margin: 0;
}

.tool-btn {
  display: block;
  width: 100%;
  padding: 0.6rem 0.75rem;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--text);
  font: inherit;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.04);
}

.tool-btn.active {
  background: rgba(124, 156, 224, 0.12);
  border-left-color: var(--accent);
}

.tool-name {
  display: block;
  font-weight: 500;
  font-size: 0.9rem;
}

.tool-desc {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-results {
  padding: 1rem 0.75rem;
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>
