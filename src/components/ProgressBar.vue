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

<style scoped>
.progress-numbers {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.raised {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.unit {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-soft);
}

.goal {
  font-size: 0.85rem;
  color: var(--text-soft);
  font-weight: 600;
}

.progress-track {
  height: 12px;
  border-radius: 999px;
  background: rgba(31, 35, 72, 0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #0582ca, #265dd7);
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.progress-fill.reached {
  background: linear-gradient(90deg, #21bca5, #41a38e);
}

.progress-percent {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--nimiq-light-blue);
}

.progress-percent.reached {
  color: var(--nimiq-green);
}
</style>
