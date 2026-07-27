<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createCollection } from '../lib/store'
import { getDefaultAddress } from '../lib/nimiq'
import { useNimiq } from '../lib/nimiq'
import { isValidNimiqAddress } from '../lib/format'

const router = useRouter()
const { nimiqConnecting } = useNimiq()

const title = ref('')
const description = ref('')
const goal = ref<number | null>(null)
const address = ref('')
const addressFromWallet = ref(false)
const submitting = ref(false)
const error = ref('')

onMounted(async () => {
  // Inside Nimiq Pay: prefill the organizer address from the wallet.
  const walletAddress = await getDefaultAddress()
  if (walletAddress && !address.value) {
    address.value = walletAddress
    addressFromWallet.value = true
  }
})

function create() {
  error.value = ''
  if (!title.value.trim()) {
    error.value = 'Give your collection a name.'
    return
  }
  if (!goal.value || goal.value <= 0) {
    error.value = 'Set a goal amount in NIM.'
    return
  }
  if (!isValidNimiqAddress(address.value)) {
    error.value = 'Enter a valid Nimiq address (starts with NQ) — this is where contributions go.'
    return
  }
  submitting.value = true
  const collection = createCollection({
    title: title.value.trim(),
    description: description.value.trim() || undefined,
    goalAmount: goal.value,
    organizerAddress: address.value.trim().toUpperCase(),
  })
  router.push(`/c/${collection.id}/dashboard`)
}
</script>

<template>
  <div class="stack">
    <div class="hero">
      <h1>Collect money from your group</h1>
      <p class="tagline">
        Birthday gift, team lunch, farewell fund — create one link, share it,
        and everyone pays their share with one tap in Nimiq Pay.
      </p>
    </div>

    <div class="card stack">
      <div>
        <label for="title">Collection name</label>
        <input id="title" v-model="title" type="text" placeholder="Sarah's Birthday Gift" maxlength="60" />
      </div>

      <div>
        <label for="goal">Goal amount (NIM)</label>
        <input id="goal" v-model.number="goal" type="number" min="1" step="any" placeholder="150" inputmode="decimal" />
      </div>

      <div>
        <label for="desc">Message to contributors <span class="optional">optional</span></label>
        <textarea id="desc" v-model="description" rows="2" maxlength="200"
          placeholder="Let's get her that espresso machine she keeps talking about ☕" />
      </div>

      <div>
        <label for="addr">Your Nimiq address</label>
        <input id="addr" v-model="address" type="text" class="mono" placeholder="NQ…" spellcheck="false" />
        <p v-if="addressFromWallet" class="hint">✓ Filled from your Nimiq Pay wallet — contributions land here instantly.</p>
        <p v-else-if="nimiqConnecting" class="hint">Checking for your Nimiq Pay wallet…</p>
        <p v-else class="hint">Contributions are paid directly to this address. Open in Nimiq Pay to autofill.</p>
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>

      <button class="btn btn-gold" :disabled="submitting" @click="create">
        Create Collection Link
      </button>
    </div>

    <div class="perks">
      <span>⚡ Instant settlement</span>
      <span>🆓 Zero fees</span>
      <span>🔗 No accounts needed</span>
    </div>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 0.5rem 0;
}

.tagline {
  color: var(--text-soft);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0.5rem 0 0;
}

.optional {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  opacity: 0.7;
}
.perks {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-soft);
}
</style>
