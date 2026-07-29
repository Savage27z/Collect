<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCollection, importCollection, addContribution, raisedAmount } from '../lib/store'
import { decodeCollection } from '../lib/share'
import { payNim, useNimiq, MIN_CONTRIBUTION_NIM, MAX_CONTRIBUTION_NIM } from '../lib/nimiq'
import { formatNim, shortAddress } from '../lib/format'
import ProgressBar from '../components/ProgressBar.vue'
import ContributorList from '../components/ContributorList.vue'

const route = useRoute()
const { nimiqReady, nimiqConnecting } = useNimiq()

const id = computed(() => String(route.params.id))
// Bump to re-read reactive store state after mutations.
const version = ref(0)
const collection = computed(() => {
  void version.value
  return getCollection(id.value)
})

const amount = ref<number | null>(null)
const name = ref('')
const paying = ref(false)
const paidTx = ref('')
const payError = ref('')
/** The `?d=` snapshot failed validation — a malformed or tampered link. */
const linkInvalid = ref(false)
/** This link names a different payment address than the one we stored before. */
const addressMismatch = ref(false)

const quickAmounts = [5, 10, 20, 50]

onMounted(() => {
  // Shared links carry a snapshot of the collection in the `d` query param.
  const encoded = route.query.d
  if (typeof encoded === 'string') {
    const decoded = decodeCollection(encoded, id.value)
    if (!decoded) {
      linkInvalid.value = true
    } else {
      const result = importCollection(decoded)
      addressMismatch.value = result.addressMismatch
    }
    version.value++
  }
})

const raised = computed(() => (collection.value ? raisedAmount(collection.value) : 0))
const isClosed = computed(() => collection.value?.status === 'closed')

async function contribute() {
  const c = collection.value
  if (!c || !amount.value || amount.value <= 0) {
    payError.value = 'Pick an amount first.'
    return
  }
  if (amount.value < MIN_CONTRIBUTION_NIM) {
    payError.value = `Minimum contribution is ${MIN_CONTRIBUTION_NIM} NIM.`
    return
  }
  if (amount.value > MAX_CONTRIBUTION_NIM) {
    payError.value = `That's over the ${formatNim(MAX_CONTRIBUTION_NIM)} NIM limit — check the amount.`
    return
  }
  payError.value = ''
  paying.value = true
  try {
    let txHash: string
    if (nimiqReady.value) {
      txHash = await payNim(c.organizerAddress, amount.value, `Collect: ${c.title}`)
    } else {
      // Demo mode outside Nimiq Pay: simulate the payment so the flow can be tested.
      const ok = confirm(
        `Demo mode (not running inside Nimiq Pay)\n\nSimulate paying ${formatNim(amount.value)} NIM to\n${c.organizerAddress}?`
      )
      if (!ok) {
        paying.value = false
        return
      }
      await new Promise(r => setTimeout(r, 600))
      txHash = 'demo-' + Math.random().toString(36).slice(2, 10)
    }
    addContribution(c.id, {
      contributorName: name.value.trim() || undefined,
      amount: amount.value,
      txHash,
      timestamp: Date.now(),
    })
    paidTx.value = txHash
    amount.value = null
    version.value++
  } catch (e: any) {
    payError.value = e?.message || 'Payment was cancelled or failed.'
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <div v-if="!collection" class="card stack notfound">
    <h1>{{ linkInvalid ? 'This link looks broken' : 'Collection not found' }}</h1>
    <p v-if="linkInvalid" class="hint">
      The collection data in this link is malformed or was modified in transit.
      Ask the organizer to send you the original link.
    </p>
    <p v-else class="hint">This link may be incomplete — ask the organizer to share it again.</p>
    <router-link to="/create" class="btn btn-primary">Create your own collection</router-link>
  </div>

  <div v-else class="stack">
    <div class="hero card">
      <h1>{{ collection.title }}</h1>
      <p v-if="collection.description" class="description">{{ collection.description }}</p>
      <ProgressBar :raised="raised" :goal="collection.goalAmount" />
    </div>

    <div v-if="paidTx" class="banner banner-success">
      ✅ Thank you for contributing! You're on the wall below.
      <span v-if="!paidTx.startsWith('demo-')" class="mono tx">tx {{ paidTx.slice(0, 16) }}…</span>
    </div>

    <div v-if="addressMismatch" class="banner banner-warning">
      ⚠️ <strong>This link points to a different wallet</strong> than the one you saw
      before for this collection. Someone may have altered it. Check with the
      organizer before paying.
    </div>

    <div v-if="isClosed" class="banner banner-info">
      This collection is closed. Thanks to everyone who chipped in! 💙
    </div>

    <div v-else-if="!paidTx" class="card stack">
      <h2>Chip in</h2>

      <div class="chips">
        <button v-for="q in quickAmounts" :key="q" class="chip" :class="{ active: amount === q }" @click="amount = q">
          {{ q }} NIM
        </button>
      </div>

      <div>
        <label for="amount">Or custom amount (NIM)</label>
        <input id="amount" v-model.number="amount" type="number" min="0.01" step="any" placeholder="25" inputmode="decimal" />
      </div>

      <div>
        <label for="name">Your name <span class="optional">optional — shown on the wall</span></label>
        <input id="name" v-model="name" type="text" placeholder="Bob" maxlength="30" />
      </div>

      <div class="recipient">
        <span class="recipient-label">Paying</span>
        <span class="mono recipient-address">{{ shortAddress(collection.organizerAddress) }}</span>
      </div>

      <p v-if="payError" class="error-text">{{ payError }}</p>

      <button class="btn btn-gold pay-btn" :disabled="paying || nimiqConnecting" @click="contribute">
        <template v-if="paying">Waiting for Nimiq Pay…</template>
        <template v-else-if="nimiqConnecting">Connecting…</template>
        <template v-else>💸 Contribute{{ amount ? ` ${formatNim(amount)} NIM` : '' }}</template>
      </button>
      <p v-if="!nimiqReady && !nimiqConnecting" class="hint center">
        Not inside Nimiq Pay — payments run in demo mode.
      </p>
    </div>

    <div class="card stack">
      <h2>Contributors ({{ collection.contributions.length }})</h2>
      <ContributorList :contributions="collection.contributions" />
    </div>
  </div>
</template>

<style scoped>
.notfound {
  text-align: center;
}

.hero {
  text-align: center;
}

.description {
  color: var(--text-soft);
  margin: 0.5rem 0 1.25rem;
  line-height: 1.5;
}

.hero h1 {
  margin-bottom: 0.25rem;
}

.hero :deep(.progress) {
  text-align: left;
  margin-top: 1rem;
}

.chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chip {
  flex: 1;
  min-width: 4rem;
  padding: 0.6rem 0.5rem;
  border-radius: 10px;
  border: 1.5px solid var(--border);
  background: transparent;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text);
  cursor: pointer;
  transition: all 0.12s ease;
}

.chip.active {
  border-color: var(--coral);
  background: rgba(255, 93, 115, 0.12);
}

.optional {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  opacity: 0.7;
}

.pay-btn {
  font-size: 1.05rem;
}

.recipient {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  background: rgba(43, 30, 20, 0.04);
}

.recipient-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-soft);
}

.recipient-address {
  font-weight: 700;
  font-size: 0.85rem;
}

.center {
  text-align: center;
}

.tx {
  display: block;
  margin-top: 0.25rem;
  opacity: 0.8;
}
</style>
