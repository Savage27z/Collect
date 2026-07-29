<script setup lang="ts">
import { computed } from 'vue'
import type { Contribution } from '../lib/types'
import { formatNim, timeAgo } from '../lib/format'
import { explorerTxUrl } from '../lib/chain'

const props = defineProps<{
  contributions: Contribution[]
}>()

const sorted = computed(() =>
  [...props.contributions].sort((a, b) => b.timestamp - a.timestamp)
)

function initial(c: Contribution): string {
  return (c.contributorName?.trim()?.[0] || '?').toUpperCase()
}

/** Simulated contributions (outside Nimiq Pay) carry no real transaction. */
function isDemo(c: Contribution): boolean {
  return !c.txHash || c.txHash.startsWith('demo-')
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
        <span class="when">
          {{ timeAgo(c.timestamp) }}
          <a
            v-if="c.verified && c.txHash"
            class="tag verified"
            :href="explorerTxUrl(c.txHash)"
            target="_blank"
            rel="noopener noreferrer"
            title="Confirmed on the Nimiq blockchain — view transaction"
            @click.stop
          >✓ on-chain</a>
          <span v-else-if="isDemo(c)" class="tag demo" title="Simulated — not an on-chain payment">demo</span>
          <span v-else class="tag pending" title="Sent — waiting for blockchain confirmation">pending</span>
        </span>
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

.tag {
  display: inline-block;
  margin-left: 0.3rem;
  padding: 0.05rem 0.35rem;
  border-radius: 4px;
  background: rgba(43, 30, 20, 0.08);
  color: var(--text-softer);
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-decoration: none;
}

.tag.verified {
  background: rgba(61, 164, 126, 0.14);
  color: var(--success);
}

.tag.pending {
  background: rgba(255, 93, 115, 0.12);
  color: var(--coral-dark);
}

.amount {
  font-weight: 800;
  color: var(--coral-dark);
  font-size: 0.95rem;
  white-space: nowrap;
}
</style>
