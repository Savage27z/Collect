<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
// The shared collection page is what contributors see — keep chrome minimal there.
const isContributorPage = computed(() => /^\/c\/[^/]+$/.test(route.path))
</script>

<template>
  <div class="app">
    <header class="app-header" v-if="!isContributorPage">
      <router-link to="/" class="brand">
        <span class="brand-mark">C</span>
        <span class="brand-name">Collect</span>
      </router-link>
      <nav>
        <router-link to="/collections" class="nav-link">My collections</router-link>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
    <footer class="app-footer">
      <span>Powered by <strong>Nimiq Pay</strong> · zero fees · instant settlement</span>
    </footer>
  </div>
</template>
