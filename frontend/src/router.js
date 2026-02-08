import { createRouter, createWebHistory } from 'vue-router';

// Route components are not rendered; App uses useRoute() to drive state. Dummy component satisfies router.
const Dummy = { template: '<div></div>' };

const routes = [
  { path: '/', name: 'home', component: Dummy },
  { path: '/t/:slug', name: 'tool', component: Dummy, props: true },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
