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

