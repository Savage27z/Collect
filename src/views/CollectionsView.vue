<script setup lang="ts">
import { allCollections, raisedAmount } from '../lib/store'
import { formatNim } from '../lib/format'

const collections = allCollections()
</script>

<template>
  <div class="stack">
    <h1>Your collections</h1>

    <div v-if="collections.length === 0" class="card empty">
      <p>Nothing here yet.</p>
      <router-link to="/" class="btn btn-gold">Start a collection</router-link>
    </div>

    <router-link
      v-for="c in collections"
      :key="c.id"
      :to="`/c/${c.id}/dashboard`"
      class="card row"
    >
      <div class="info">
        <span class="title">{{ c.title }}</span>
        <span class="meta">
          {{ formatNim(raisedAmount(c)) }} / {{ formatNim(c.goalAmount) }} NIM ·
          {{ c.contributions.length }} contributor{{ c.contributions.length === 1 ? '' : 's' }}
        </span>
        <span class="bar">
          <span
            class="fill"
            :class="{ done: raisedAmount(c) >= c.goalAmount }"
            :style="{ width: Math.min(100, (raisedAmount(c) / c.goalAmount) * 100) + '%' }"
          />
        </span>
      </div>
      <span class="status" :class="c.status">{{ c.status }}</span>
    </router-link>
  </div>
</template>

<style scoped>
.empty {
  text-align: center;
  color: var(--text-soft);
}

.empty .btn {
  margin-top: 0.5rem;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text);
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.title {
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  font-size: 0.8rem;
  color: var(--text-soft);
}

.bar {
  display: block;
  height: 6px;
  border-radius: 999px;
  background: rgba(31, 35, 72, 0.08);
  overflow: hidden;
}

.fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #0582ca, #265dd7);
}

.fill.done {
  background: linear-gradient(90deg, #21bca5, #41a38e);
}

.status {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.status.open {
  background: rgba(33, 188, 165, 0.12);
  color: #148673;
}

.status.closed {
  background: rgba(31, 35, 72, 0.08);
  color: var(--text-soft);
}
</style>
