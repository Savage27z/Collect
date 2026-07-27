<script setup lang="ts">
import { computed } from 'vue'
import type { Contribution } from '../lib/types'
import { formatNim, timeAgo } from '../lib/format'

const props = defineProps<{
  contributions: Contribution[]
}>()

const sorted = computed(() =>
  [...props.contributions].sort((a, b) => b.timestamp - a.timestamp)
)

function initial(c: Contribution): string {
  return (c.contributorName?.trim()?.[0] || '?').toUpperCase()
}
</script>

<template>
  <div v-if="sorted.length === 0" class="empty">
    No contributions yet — be the first! 🚀
  </div>
  <ul v-else class="list">
    <li v-for="(c, i) in sorted" :key="c.timestamp + '-' + i" class="row">
      <span class="avatar">{{ initial(c) }}</span>
      <span class="who">
        <span class="name">{{ c.contributorName || 'Anonymous' }}</span>
        <span class="when">{{ timeAgo(c.timestamp) }}</span>
      </span>
      <span class="amount">+{{ formatNim(c.amount) }} NIM</span>
    </li>
  </ul>
</template>

<style scoped>
.empty {
  text-align: center;
  color: var(--text-soft);
  font-size: 0.9rem;
  padding: 1rem 0;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.avatar {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  font-weight: 800;
  font-size: 0.95rem;
  background: rgba(255, 93, 115, 0.14);
  color: var(--coral-dark);
  flex-shrink: 0;
}

.who {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.name {
  font-weight: 700;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.when {
  font-size: 0.75rem;
  color: var(--text-soft);
}

.amount {
  font-weight: 800;
  color: var(--coral-dark);
  font-size: 0.95rem;
  white-space: nowrap;
}
</style>
