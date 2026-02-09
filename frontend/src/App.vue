<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ToolList from './components/ToolList.vue';
import ToolFrame from './components/ToolFrame.vue';

const FAVORITES_KEY = 'helpers-favorites';
const FAVORITES_MAX = 6;

// Global encryption key manager — same localStorage key used by tools (see tools/data-masking, etc.).
const ENCRYPTION_KEYS_STORAGE_KEY = 'helpers-encryption-keys';

function loadEncryptionKeys() {
  try {
    const raw = localStorage.getItem(ENCRYPTION_KEYS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveEncryptionKeys(obj) {
  try {
    localStorage.setItem(ENCRYPTION_KEYS_STORAGE_KEY, JSON.stringify(obj));
  } catch (_) {}
}

// Entry can be legacy string or { value, origin }.
function keyEntryValue(entry) {
  return typeof entry === 'object' && entry != null && 'value' in entry ? entry.value : entry;
}

function keyEntryOrigin(entry) {
  return typeof entry === 'object' && entry != null && entry.origin ? entry.origin : '';
}

// Global regex pattern manager — same localStorage key used by tools (e.g. data-masking).
const REGEX_PATTERNS_STORAGE_KEY = 'helpers-regex-patterns';

function loadRegexPatterns() {
  try {
    const raw = localStorage.getItem(REGEX_PATTERNS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveRegexPatterns(obj) {
  try {
    localStorage.setItem(REGEX_PATTERNS_STORAGE_KEY, JSON.stringify(obj));
  } catch (_) {}
}

function regexEntryPattern(entry) {
  return typeof entry === 'object' && entry != null && 'pattern' in entry ? entry.pattern : String(entry ?? '');
}

function regexEntryFlags(entry) {
  return typeof entry === 'object' && entry != null && entry.flags != null ? entry.flags : 'g';
}

function regexEntryOrigin(entry) {
  return typeof entry === 'object' && entry != null && entry.origin ? entry.origin : '';
}

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
const showKeyManager = ref(false);
const storedKeys = ref({});
const newKeyName = ref('');
const newKeyValue = ref('');
const keyManagerMessage = ref('');
const showRegexManager = ref(false);
const storedRegexes = ref({});
const newRegexName = ref('');
const newRegexPattern = ref('');
const newRegexFlags = ref('g');
const regexManagerMessage = ref('');

const manifestUrl = '/tools-manifest.json';

function openKeyManager() {
  storedKeys.value = loadEncryptionKeys();
  showKeyManager.value = true;
  keyManagerMessage.value = '';
  newKeyName.value = '';
  newKeyValue.value = '';
}

function closeKeyManager() {
  showKeyManager.value = false;
}

function refreshStoredKeys() {
  storedKeys.value = loadEncryptionKeys();
}

function addStoredKey() {
  const name = (newKeyName.value || '').trim().toLowerCase().replace(/\s+/g, '-');
  const val = (newKeyValue.value || '').trim();
  if (!name) {
    keyManagerMessage.value = 'Enter a name for this key (e.g. work, personal).';
    return;
  }
  if (!val) {
    keyManagerMessage.value = 'Enter the key value.';
    return;
  }
  const obj = loadEncryptionKeys();
  if (Object.prototype.hasOwnProperty.call(obj, name)) {
    keyManagerMessage.value = 'A key with this name already exists. Use a different name or delete it first.';
    return;
  }
  obj[name] = { value: val, origin: 'manual' };
  saveEncryptionKeys(obj);
  refreshStoredKeys();
  newKeyName.value = '';
  newKeyValue.value = '';
  keyManagerMessage.value = 'Saved.';
  setTimeout(() => (keyManagerMessage.value = ''), 2000);
}

function deleteStoredKey(name) {
  const obj = loadEncryptionKeys();
  delete obj[name];
  saveEncryptionKeys(obj);
  refreshStoredKeys();
}

function copyStoredKey(name) {
  const obj = loadEncryptionKeys();
  const val = keyEntryValue(obj[name]);
  if (val == null) return;
  navigator.clipboard.writeText(val).then(() => {
    keyManagerMessage.value = 'Copied to clipboard.';
    setTimeout(() => (keyManagerMessage.value = ''), 2000);
  });
}

function openRegexManager() {
  storedRegexes.value = loadRegexPatterns();
  showRegexManager.value = true;
  regexManagerMessage.value = '';
  newRegexName.value = '';
  newRegexPattern.value = '';
  newRegexFlags.value = 'g';
}

function closeRegexManager() {
  showRegexManager.value = false;
}

function refreshStoredRegexes() {
  storedRegexes.value = loadRegexPatterns();
}

function addStoredRegex() {
  const name = (newRegexName.value || '').trim().toLowerCase().replace(/\s+/g, '-');
  const pattern = (newRegexPattern.value || '').trim();
  const flags = (newRegexFlags.value || 'g').trim() || 'g';
  if (!name) {
    regexManagerMessage.value = 'Enter a name for this pattern (e.g. ssn, postal-code).';
    return;
  }
  if (!pattern) {
    regexManagerMessage.value = 'Enter the regex pattern.';
    return;
  }
  try {
    new RegExp(pattern, flags);
  } catch {
    regexManagerMessage.value = 'Invalid regex. Check pattern and flags.';
    return;
  }
  const obj = loadRegexPatterns();
  if (Object.prototype.hasOwnProperty.call(obj, name)) {
    regexManagerMessage.value = 'A pattern with this name already exists. Use a different name or delete it first.';
    return;
  }
  obj[name] = { pattern, flags, origin: 'manual' };
  saveRegexPatterns(obj);
  refreshStoredRegexes();
  newRegexName.value = '';
  newRegexPattern.value = '';
  newRegexFlags.value = 'g';
  regexManagerMessage.value = 'Saved.';
  setTimeout(() => (regexManagerMessage.value = ''), 2000);
}

function deleteStoredRegex(name) {
  const obj = loadRegexPatterns();
  delete obj[name];
  saveRegexPatterns(obj);
  refreshStoredRegexes();
}

function copyStoredRegex(name) {
  const obj = loadRegexPatterns();
  const pattern = regexEntryPattern(obj[name]);
  if (pattern == null) return;
  navigator.clipboard.writeText(pattern).then(() => {
    regexManagerMessage.value = 'Pattern copied to clipboard.';
    setTimeout(() => (regexManagerMessage.value = ''), 2000);
  });
}

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
    list = list.filter(
      (t) =>
        (t.categories && t.categories.includes(selectedCategory.value)) ||
        t.category === selectedCategory.value
    );
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
          <span>TinyTools</span>
        </router-link>
        <p class="tagline">Converters, text, time, encoding &amp; more — one place</p>
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
        <div class="header-managers">
          <button
            type="button"
            class="keys-btn"
            title="Encryption key manager"
            @click="openKeyManager"
          >
            Keys
          </button>
          <button
            type="button"
            class="keys-btn"
            title="Regex pattern manager"
            @click="openRegexManager"
          >
            Regex
          </button>
        </div>
      </div>
    </header>

    <div v-if="showKeyManager" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="key-manager-title" @click.self="closeKeyManager">
      <div class="modal key-manager-modal">
        <h2 id="key-manager-title" class="modal-title">Encryption key manager</h2>
        <p class="modal-note">Keys are stored only in this browser (localStorage). Each key has a unique name and an origin (the tool that saved it, or “manual”). You cannot overwrite an existing name — use a new name or delete the key first.</p>
        <div class="key-manager-list">
          <template v-for="(entry, name) in storedKeys" :key="name">
            <div class="key-manager-row">
              <span class="key-manager-name">{{ name }}</span>
              <span class="key-manager-origin">{{ keyEntryOrigin(entry) || 'manual' }}</span>
              <button type="button" class="key-manager-copy" @click="copyStoredKey(name)">Copy</button>
              <button type="button" class="key-manager-delete" aria-label="Delete key" @click="deleteStoredKey(name)">Delete</button>
            </div>
          </template>
          <p v-if="Object.keys(storedKeys).length === 0" class="key-manager-empty">No keys stored. Add one below (name + value) or save a key from a tool and give it a name.</p>
        </div>
        <div class="key-manager-add">
          <input v-model="newKeyName" type="text" placeholder="Name (e.g. work, personal)" class="key-manager-input" required @keydown.enter.prevent="addStoredKey" />
          <input v-model="newKeyValue" type="password" placeholder="Key value" class="key-manager-input" autocomplete="off" @keydown.enter.prevent="addStoredKey" />
          <button type="button" class="key-manager-save" @click="addStoredKey">Save</button>
        </div>
        <p class="modal-note key-manager-add-note">Use a unique name for each key. Keys saved from tools store their origin (e.g. data-masking). You cannot overwrite an existing name.</p>
        <p v-if="keyManagerMessage" class="key-manager-msg">{{ keyManagerMessage }}</p>
        <button type="button" class="modal-close" @click="closeKeyManager">Close</button>
      </div>
    </div>

    <div v-if="showRegexManager" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="regex-manager-title" @click.self="closeRegexManager">
      <div class="modal key-manager-modal">
        <h2 id="regex-manager-title" class="modal-title">Regex pattern manager</h2>
        <p class="modal-note">Patterns are stored only in this browser (localStorage). Use them in tools like Data masking for custom regex masking. Each pattern has a unique name; you cannot overwrite an existing name.</p>
        <div class="key-manager-list">
          <template v-for="(entry, name) in storedRegexes" :key="name">
            <div class="key-manager-row">
              <span class="key-manager-name">{{ name }}</span>
              <span class="regex-manager-pattern" :title="regexEntryPattern(entry)">{{ regexEntryPattern(entry) }}</span>
              <span class="key-manager-origin">{{ regexEntryFlags(entry) }} · {{ regexEntryOrigin(entry) || 'manual' }}</span>
              <button type="button" class="key-manager-copy" @click="copyStoredRegex(name)">Copy</button>
              <button type="button" class="key-manager-delete" aria-label="Delete pattern" @click="deleteStoredRegex(name)">Delete</button>
            </div>
          </template>
          <p v-if="Object.keys(storedRegexes).length === 0" class="key-manager-empty">No patterns stored. Add one below (name, pattern, flags) or use them from tools like Data masking.</p>
        </div>
        <div class="key-manager-add regex-manager-add">
          <input v-model="newRegexName" type="text" placeholder="Name (e.g. ssn, postal-code)" class="key-manager-input regex-manager-name" required @keydown.enter.prevent="addStoredRegex" />
          <input v-model="newRegexPattern" type="text" placeholder="Pattern (e.g. \\d{3}-\\d{2}-\\d{4})" class="key-manager-input regex-manager-pattern-input" @keydown.enter.prevent="addStoredRegex" />
          <input v-model="newRegexFlags" type="text" placeholder="Flags (e.g. g, gi)" class="key-manager-input regex-manager-flags" @keydown.enter.prevent="addStoredRegex" />
          <button type="button" class="key-manager-save" @click="addStoredRegex">Save</button>
        </div>
        <p class="modal-note key-manager-add-note">Use a unique name. Flags: g (global), i (ignore case), etc. You cannot overwrite an existing name.</p>
        <p v-if="regexManagerMessage" class="key-manager-msg">{{ regexManagerMessage }}</p>
        <button type="button" class="modal-close" @click="closeRegexManager">Close</button>
      </div>
    </div>

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
        <div v-else class="landing">
          <h2 class="landing-title">TinyTools</h2>
          <p class="landing-lead">A collection of small, focused tools — converters (units, time, temperature, speed, finance), text and encoding utilities, reference (Unicode, ports, regex), and more. No sign-up, no tracking. Each tool has a direct URL so you can bookmark or share it.</p>
          <ul class="landing-features">
            <li><strong>Shareable links</strong> — Every tool lives at <code>/t/<em>slug</em></code>; query params are preserved so you can link to a specific state (e.g. a timestamp or encode result).</li>
            <li><strong>Search & categories</strong> — Find tools by name, description, or keywords; filter by category.</li>
            <li><strong>Sandboxed</strong> — Tools run in iframes with a strict sandbox; the shell only serves static files and the manifest.</li>
            <li><strong>Easy to extend</strong> — Add a folder under <code>tools/</code> with <code>index.html</code> and <code>meta.json</code>, run <code>generate-manifest</code>, and the tool shows up in the list.</li>
          </ul>
          <p class="landing-cta">Pick a tool from the sidebar or search to get started.</p>
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

.landing {
  padding: 2rem 2.5rem;
  max-width: 42rem;
  color: var(--text-muted);
}

.landing-title {
  margin: 0 0 0.5rem;
  color: var(--text);
  font-size: 1.5rem;
  font-weight: 600;
}

.landing-lead {
  margin: 0 0 1.25rem;
  font-size: 0.95rem;
  line-height: 1.55;
}

.landing-features {
  margin: 0 0 1.25rem;
  padding-left: 1.25rem;
  font-size: 0.9rem;
  line-height: 1.6;
}

.landing-features li {
  margin-bottom: 0.6rem;
}

.landing-features code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  padding: 0.1em 0.35em;
  background: var(--bg-elevated);
  border-radius: 4px;
  color: var(--text);
}

.landing-cta {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
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

.header-managers {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-left: auto;
}

.keys-btn {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
}

.keys-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
  max-width: 28rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}

.modal-note {
  margin: 0 0 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.key-manager-list {
  margin-bottom: 1rem;
}

.key-manager-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.key-manager-name {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  min-width: 6rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.key-manager-origin {
  flex: 1;
  font-size: 0.75rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
}

.key-manager-copy,
.key-manager-delete {
  padding: 0.2rem 0.4rem;
  font-size: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
}

.key-manager-delete {
  color: var(--text-muted);
}

.key-manager-delete:hover {
  color: #e08080;
}

.key-manager-empty {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.key-manager-add {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.25rem;
}

.key-manager-add-note {
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
}

.key-manager-input {
  flex: 1;
  min-width: 8rem;
  padding: 0.35rem 0.5rem;
  font-size: 0.85rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text);
}

.key-manager-save {
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
  border: 1px solid var(--accent);
  border-radius: 4px;
  background: var(--accent);
  color: var(--bg);
  cursor: pointer;
}

.key-manager-msg {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--accent);
}

.regex-manager-pattern {
  flex: 1;
  min-width: 0;
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
}

.regex-manager-add .regex-manager-name {
  min-width: 8rem;
}

.regex-manager-add .regex-manager-pattern-input {
  flex: 1;
  min-width: 12rem;
}

.regex-manager-add .regex-manager-flags {
  min-width: 4rem;
  max-width: 5rem;
}

.modal-close {
  display: block;
  margin-top: 0.5rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
}

.modal-close:hover {
  border-color: var(--text-muted);
}
</style>
