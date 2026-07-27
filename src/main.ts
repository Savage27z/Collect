import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import '@nimiq/style/nimiq-style.min.css'
import './style.css'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/LandingView.vue') },
    { path: '/create', component: () => import('./views/CreateView.vue') },
    { path: '/c/:id', component: () => import('./views/CollectionView.vue') },
    { path: '/c/:id/dashboard', component: () => import('./views/DashboardView.vue') },
    { path: '/collections', component: () => import('./views/CollectionsView.vue') },
  ],
})

createApp(App).use(router).mount('#app')
