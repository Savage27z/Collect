<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
// The landing page brings its own full-width layout and footer.
const isLanding = computed(() => route.path === '/')
// The shared collection page is what contributors see — keep chrome minimal there.
const isContributorPage = computed(() => /^\/c\/[^/]+$/.test(route.path))
</script>

<template>
  <div class="app" :class="{ landing: isLanding }">
    <header class="app-header" v-if="!isContributorPage" :class="{ overlay: isLanding }">
      <router-link to="/" class="brand">
        <span class="brand-mark">C</span>
        <span class="brand-name">Collect</span>
      </router-link>
      <nav>
        <router-link to="/collections" class="nav-link">My collections</router-link>
      </nav>
    </header>
    <main class="app-main" :class="{ fullbleed: isLanding }">
      <router-view />
    </main>
    <footer class="app-footer" v-if="!isLanding">
      <span>Powered by <strong>Nimiq Pay</strong> · zero fees · instant settlement</span>
    </footer>
  </div>
</template>

<style scoped>
.app-main.fullbleed {
  max-width: none;
  padding: 0;
}

/* On the landing page the header floats over the cream hero. */
.app-header.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  max-width: none;
  z-index: 10;
}

.app.landing {
  position: relative;
  background: #fff7ee;
}
</style>
