<script setup lang="ts">
import { computed } from 'vue'
import { formatNim } from '../lib/format'

const props = defineProps<{
  raised: number
  goal: number
}>()

const percent = computed(() => {
  if (props.goal <= 0) return 0
  return Math.min(100, (props.raised / props.goal) * 100)
})

const reached = computed(() => props.raised >= props.goal && props.goal > 0)
</script>

<template>
  <div class="progress">
    <div class="progress-numbers">
      <span class="raised">{{ formatNim(raised) }} <span class="unit">NIM</span></span>
      <span class="goal">of {{ formatNim(goal) }} NIM goal</span>
    </div>
    <div class="progress-track" role="progressbar" :aria-valuenow="Math.round(percent)" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-fill" :class="{ reached }" :style="{ width: percent + '%' }" />
    </div>
    <div class="progress-percent" :class="{ reached }">
      {{ reached ? '🎉 Goal reached!' : Math.round(percent) + '% funded' }}
    </div>
  </div>
</template>

