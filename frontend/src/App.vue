<script setup>
import { ref, computed, onMounted } from 'vue';
import ToolList from './components/ToolList.vue';
import ToolFrame from './components/ToolFrame.vue';

const manifest = ref(null);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const selectedTool = ref(null);
const selectedCategory = ref(null);

const manifestUrl = '/tools-manifest.json';

onMounted(async () => {
  try {
    const res = await fetch(manifestUrl);
    if (!res.ok) throw new Error('Failed to load tools');
    manifest.value = await res.json();
  } catch (e) {
    error.value = e.message || 'Could not load tools list.';
  } finally {
    loading.value = false;
  }
});

const categories = computed(() => manifest.value?.categories ?? []);

const filteredTools = computed(() => {
  if (!manifest.value?.tools) return [];
  let list = manifest.value.tools;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.keywords && t.keywords.some((k) => k.toLowerCase().includes(q)))
    );
  }
  if (selectedCategory.value) {
    list = list.filter((t) => t.category === selectedCategory.value);
  }
  return list;
});

function selectTool(tool) {
  selectedTool.value = tool;
}

function clearSelection() {
  selectedTool.value = null;
}

function selectCategory(cat) {
  selectedCategory.value = selectedCategory.value === cat ? null : cat;
}
</script>

<template>
  <div class="app">
    <header class="header">
      <a href="#" class="logo" @click.prevent="clearSelection">
        <img src="/img/logo.png" alt="" class="logo-img" />
        <span>Helpers</span>
      </a>
      <p class="tagline">Dev tools — encoding, hashing, text &amp; more</p>
    </header>

    <main class="main">
      <aside class="sidebar">
        <div v-if="error" class="error">{{ error }}</div>
        <div v-else-if="loading" class="loading">Loading tools…</div>
        <template v-else>
          <div class="search-wrap">
            <input
              v-model="searchQuery"
              type="search"
              class="search"
              placeholder="Search tools…"
              autocomplete="off"
              aria-label="Search tools"
            />
          </div>
          <ToolList
            :categories="categories"
            :tools="filteredTools"
            :selected-tool="selectedTool"
            :selected-category="selectedCategory"
            @select-tool="selectTool"
            @select-category="selectCategory"
          />
        </template>
      </aside>
      <section class="content">
        <ToolFrame v-if="selectedTool" :tool="selectedTool" />
        <div v-else class="welcome">
          <h2>Pick a tool</h2>
          <p>Choose a tool from the list or use search. Each tool runs in its own sandbox.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style>
:root {
  --bg: #0f0f0f;
  --bg-elevated: #181818;
  --border: #2a2a2a;
  --text: #e8e8e8;
  --text-muted: #888;
  --accent: #7c9ce0;
  --accent-hover: #9ab4ed;
  --radius: 8px;
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.5;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-elevated);
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--text);
  text-decoration: none;
}

.logo:hover {
  color: var(--accent);
}

.logo-img {
  height: 1.75rem;
  width: auto;
  vertical-align: middle;
}

.tagline {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.main {
  display: flex;
  flex: 1;
  min-height: 0;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  background: var(--bg-elevated);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-wrap {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.search {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text);
  font: inherit;
}

.search::placeholder {
  color: var(--text-muted);
}

.search:focus {
  outline: none;
  border-color: var(--accent);
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.error,
.loading {
  padding: 1rem;
  color: var(--text-muted);
}

.error {
  color: #e08080;
}

.welcome {
  padding: 2rem;
  color: var(--text-muted);
}

.welcome h2 {
  margin: 0 0 0.5rem;
  color: var(--text);
  font-size: 1.125rem;
  font-weight: 600;
}
</style>
