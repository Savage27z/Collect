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
      <div class="progress-fill" :class="{ reached }" :style="{ width: percent + '%' }">
        <span class="shimmer" />
      </div>
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
  height: 14px;
  border-radius: 999px;
  background: rgba(43, 30, 20, 0.08);
  overflow: hidden;
}

.progress-fill {
  position: relative;
  height: 100%;
  border-radius: 999px;
  background: var(--coral);
  overflow: hidden;
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.progress-fill.reached {
  background: var(--success);
}

.shimmer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 2.2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(250%); }
}

.progress-percent {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--coral-dark);
}

.progress-percent.reached {
  color: var(--success);
}
</style>
