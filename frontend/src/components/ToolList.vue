<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  tools: { type: Array, default: () => [] },
  selectedTool: { type: Object, default: null },
  selectedCategory: { type: String, default: null },
});

const emit = defineEmits(['select-category']);

const categoryIcons = {
  'Text': '📝',
  'Encoding': '🔐',
  'Cryptography': '🔑',
  'Web & APIs': '🌐',
  'CSS & Design': '🎨',
  'Units & Numbers': '🔢',
  'Time & Date': '🕐',
  'Reference': '📚',
  'Other': '📌',
};

function categoryIcon(cat) {
  return categoryIcons[cat] || '📌';
}
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
        draggable="false"
        @click="emit('select-category', cat)"
      >
        <span class="category-icon" aria-hidden="true">{{ categoryIcon(cat) }}</span>
        {{ cat }}
      </button>
    </nav>
    <ul class="tools" role="list">
      <li v-for="tool in tools" :key="tool.id" class="tool-item">
        <router-link
          :to="{ name: 'tool', params: { slug: tool.id } }"
          class="tool-btn"
          :class="{ active: selectedTool?.id === tool.id }"
          :title="tool.description || tool.name"
          draggable="false"
        >
          <span v-if="tool.icon" class="tool-icon" aria-hidden="true">{{ tool.icon }}</span>
          <span class="tool-name">{{ tool.name }}</span>
          <span v-if="tool.description" class="tool-desc">{{ tool.description }}</span>
        </router-link>
      </li>
    </ul>
    <p v-if="tools.length === 0" class="no-results">No tools match your search.</p>
  </div>
</template>

<style scoped>
.tool-list {
  padding: 0.5rem 0;
  -webkit-user-drag: none;
  user-drag: none;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0 0.75rem 0.5rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.5rem;
  flex-shrink: 0;
  -webkit-user-drag: none;
  user-drag: none;
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

.category-icon {
  display: inline-block;
  margin-right: 0.35rem;
  font-size: 0.95em;
  line-height: 1;
  vertical-align: middle;
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
  text-decoration: none;
}

.tool-btn:hover {
  background: rgba(255, 255, 255, 0.04);
}

.tool-btn.active {
  background: rgba(124, 156, 224, 0.12);
  border-left-color: var(--accent);
}

.tool-icon {
  display: inline-block;
  margin-right: 0.4rem;
  font-size: 1rem;
  line-height: 1;
  vertical-align: middle;
}

.tool-name {
  display: inline;
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
