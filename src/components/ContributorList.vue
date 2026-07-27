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
      <span class="avatar" :data-hue="i % 5">{{ initial(c) }}</span>
      <span class="who">
        <span class="name">{{ c.contributorName || 'Anonymous' }}</span>
        <span class="when">{{ timeAgo(c.timestamp) }}</span>
      </span>
      <span class="amount">+{{ formatNim(c.amount) }} NIM</span>
    </li>
  </ul>
</template>

