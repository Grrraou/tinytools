<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ToolList from './components/ToolList.vue';
import ToolFrame from './components/ToolFrame.vue';

const FAVORITES_KEY = 'helpers-favorites';
const FAVORITES_MAX = 6;

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, FAVORITES_MAX) : [];
  } catch {
    return [];
  }
}

function saveFavorites(list) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  } catch (_) {}
}

const route = useRoute();
const router = useRouter();
const manifest = ref(null);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const selectedCategory = ref(null);
const favorites = ref(loadFavorites());

const manifestUrl = '/tools-manifest.json';

// Selected tool is driven by URL: /t/:slug
const selectedTool = computed(() => {
  if (route.name !== 'tool' || !manifest.value?.tools) return null;
  return manifest.value.tools.find((t) => t.id === route.params.slug) || null;
});

// Pending content to inject into converter (from JSON formatter "Send to converter") — not in URL
const pendingConverterContent = ref(null);

// Tools can update the shell URL via postMessage so links stay shareable
function onMessage(e) {
  if (e.origin !== window.location.origin) return;
  if (e.data?.type === 'helpers-send-to-converter') {
    const content = e.data.content;
    if (typeof content === 'string') {
      pendingConverterContent.value = content;
      const from = e.data.from || 'json';
      const to = e.data.to || 'xml';
      router.push({
        name: 'tool',
        params: { slug: 'json-xml-array-converter' },
        query: { from, to },
      });
    }
    return;
  }
  if (e.data?.type !== 'helpers-set-query') return;
  if (route.name !== 'tool') return;
  const q = e.data.query;
  if (q && typeof q === 'object') {
    router.replace({ name: 'tool', params: { slug: route.params.slug }, query: q });
  }
}

onMounted(async () => {
  window.addEventListener('message', onMessage);
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

onUnmounted(() => {
  window.removeEventListener('message', onMessage);
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

function selectCategory(cat) {
  selectedCategory.value = selectedCategory.value === cat ? null : cat;
}

function queryString(q) {
  if (!q || typeof q !== 'object') return '';
  const s = new URLSearchParams(q).toString();
  return s ? '?' + s : '';
}

function favoriteId(slug, query) {
  return slug + queryString(query);
}

const currentFavoriteId = computed(() => {
  if (!selectedTool.value || route.name !== 'tool') return null;
  return favoriteId(route.params.slug, route.query);
});

const isCurrentFavorited = computed(() => {
  const id = currentFavoriteId.value;
  if (!id) return false;
  return favorites.value.some((f) => favoriteId(f.slug, f.query) === id);
});

const canAddFavorite = computed(() => {
  return selectedTool.value && !isCurrentFavorited.value && favorites.value.length < FAVORITES_MAX;
});

function addCurrentToFavorites() {
  if (!canAddFavorite.value) return;
  const slug = route.params.slug;
  const name = selectedTool.value?.name || slug;
  const query = { ...route.query };
  favorites.value = [...favorites.value, { slug, name, query }];
  saveFavorites(favorites.value);
}

function removeFavorite(index) {
  favorites.value = favorites.value.filter((_, i) => i !== index);
  saveFavorites(favorites.value);
}

function favoriteTo(fav) {
  return { name: 'tool', params: { slug: fav.slug }, query: fav.query || {} };
}

function toolIcon(slug) {
  const t = manifest.value?.tools?.find((x) => x.id === slug);
  return t?.icon ?? '';
}
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-top">
        <router-link to="/" class="logo">
          <img src="/img/logo.png" alt="" class="logo-img" />
          <span>Helpers</span>
        </router-link>
        <p class="tagline">Dev tools — encoding, hashing, text &amp; more</p>
      </div>
      <div class="favorites-row">
        <span class="favorites-label">Favorites</span>
        <div class="favorites-slots">
          <template v-for="(fav, index) in favorites" :key="favoriteId(fav.slug, fav.query)">
            <router-link :to="favoriteTo(fav)" class="favorite-chip" :title="fav.name + (Object.keys(fav.query || {}).length ? ' — with params' : '')">
              <span v-if="toolIcon(fav.slug)" class="favorite-icon" aria-hidden="true">{{ toolIcon(fav.slug) }}</span>
              <span class="favorite-name">{{ fav.name }}</span>
              <button type="button" class="favorite-remove" aria-label="Remove from favorites" @click.prevent.stop="removeFavorite(index)">×</button>
            </router-link>
          </template>
          <button
            v-if="canAddFavorite"
            type="button"
            class="favorite-add"
            title="Add current tool to favorites"
            @click="addCurrentToFavorites"
          >
            + Add current
          </button>
        </div>
      </div>
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
          <div class="sidebar-scroll">
            <ToolList
              :categories="categories"
              :tools="filteredTools"
              :selected-tool="selectedTool"
              :selected-category="selectedCategory"
              @select-category="selectCategory"
            />
          </div>
        </template>
      </aside>
      <section class="content">
        <ToolFrame
          v-if="selectedTool"
          :tool="selectedTool"
          :query="route.query"
          :pending-content="pendingConverterContent"
          @content-sent="pendingConverterContent = null"
        />
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

html {
  height: 100%;
  overflow: hidden;
}

body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.5;
}

#app {
  height: 100%;
  overflow: hidden;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.header {
  padding: 0.75rem 1.5rem 1rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-elevated);
}

.header-top {
  margin-bottom: 0.75rem;
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
  overflow: hidden;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
  min-height: 0;
  border-right: 1px solid var(--border);
  background: var(--bg-elevated);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-user-drag: none;
  user-drag: none;
}

.sidebar-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.search-wrap {
  flex-shrink: 0;
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
  min-height: 0;
  overflow: hidden;
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

.favorites-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.favorites-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.favorites-slots {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.favorite-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.4rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 0.8rem;
  text-decoration: none;
  max-width: 10rem;
}

.favorite-icon {
  flex-shrink: 0;
  font-size: 0.95em;
  line-height: 1;
}

.favorite-chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.favorite-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-remove {
  flex-shrink: 0;
  width: 1.1em;
  height: 1.1em;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 2px;
}

.favorite-remove:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.08);
}

.favorite-add {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px dashed var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
}

.favorite-add:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
