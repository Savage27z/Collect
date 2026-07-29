<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'
import { getCollection, raisedAmount, setStatus } from '../lib/store'
import { collectionUrl, copyText } from '../lib/share'
import { useChainSync } from '../lib/useChainSync'
import { formatNim, shortAddress } from '../lib/format'
import ProgressBar from '../components/ProgressBar.vue'
import ContributorList from '../components/ContributorList.vue'

const route = useRoute()

const id = computed(() => String(route.params.id))
const version = ref(0)
const collection = computed(() => {
  void version.value
  return getCollection(id.value)
})

const raised = computed(() => (collection.value ? raisedAmount(collection.value) : 0))
const shareUrl = computed(() => (collection.value ? collectionUrl(collection.value) : ''))

// Contributions are paid on other people's devices — the blockchain is the only
// place this device can learn about them.
const { sync, syncing, syncError, synced } = useChainSync(collection, () => version.value++)

/** Only claim on-chain verification once real transactions have been read back. */
const verifiedCount = computed(
  () => collection.value?.contributions.filter(c => c.verified).length ?? 0
)

const qrDataUrl = ref('')
const copied = ref<'' | 'link' | 'remind'>('')

/**
 * The QR encodes the plain https URL, not the nimiqpay:// deep link.
 *
 * Nimiq Pay's scanner is built for payment QRs and generic camera apps don't
 * know the custom scheme, so a deep-link QR is a dead end. An https URL scans
 * anywhere: it opens the mobile browser, which then offers "Open in Nimiq Pay".
 */
async function renderQr() {
  if (!shareUrl.value) return
  qrDataUrl.value = await QRCode.toDataURL(shareUrl.value, {
    width: 480,
    margin: 1,
    color: { dark: '#2b1e14', light: '#ffffff' },
  })
}

onMounted(renderQr)
watch(shareUrl, renderQr)

async function copyLink() {
  if (await copyText(shareUrl.value)) {
    copied.value = 'link'
    setTimeout(() => (copied.value = ''), 2000)
  }
}

async function copyReminder() {
  const c = collection.value
  if (!c) return
  const remaining = Math.max(0, c.goalAmount - raised.value)
  const message =
    `Hey! We're collecting for "${c.title}" — ` +
    `${formatNim(raised.value)}/${formatNim(c.goalAmount)} NIM so far` +
    (remaining > 0 ? `, ${formatNim(remaining)} NIM to go` : '') +
    `. Chip in here (takes one tap): ${shareUrl.value}`
  if (await copyText(message)) {
    copied.value = 'remind'
    setTimeout(() => (copied.value = ''), 2000)
  }
}

function toggleClosed() {
  const c = collection.value
  if (!c) return
  const next = c.status === 'open' ? 'closed' : 'open'
  if (next === 'closed' && !confirm('Close this collection? Contributors will no longer be able to pay.')) return
  setStatus(c.id, next)
  version.value++
}
</script>

<template>
  <div v-if="!collection" class="card stack" style="text-align: center">
    <h1>Collection not found</h1>
    <router-link to="/create" class="btn btn-primary">Create a collection</router-link>
  </div>

  <div v-else class="stack">
    <div class="card stack">
      <div class="title-row">
        <h1>{{ collection.title }}</h1>
        <span class="status" :class="collection.status">{{ collection.status }}</span>
      </div>
      <ProgressBar :raised="raised" :goal="collection.goalAmount" />
      <p class="hint">
        Payments go to <span class="mono">{{ shortAddress(collection.organizerAddress) }}</span> — your wallet, instantly.
      </p>
    </div>

    <div class="card stack share-card">
      <h2>Share your collection</h2>
      <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR code for this collection" class="qr" />
      <div class="link-box mono" @click="copyLink">{{ shareUrl }}</div>
      <div class="share-buttons">
        <button class="btn btn-primary" @click="copyLink">
          {{ copied === 'link' ? '✓ Copied!' : 'Copy link' }}
        </button>
        <button class="btn btn-ghost" @click="copyReminder">
          {{ copied === 'remind' ? '✓ Copied!' : '🔔 Copy reminder' }}
        </button>
      </div>
      <p class="hint">
        Share the link anywhere — WhatsApp, Telegram, group chat. To pay from another
        phone: scan the QR with its camera, or paste the link into Nimiq Pay → Discover.
      </p>
    </div>

    <div class="card stack">
      <div class="list-head">
        <h2>Contributors ({{ collection.contributions.length }})</h2>
        <button class="refresh" :disabled="syncing" @click="sync">
          {{ syncing ? 'Syncing…' : '↻ Refresh' }}
        </button>
      </div>
      <p v-if="syncError" class="hint">{{ syncError }}</p>
      <p v-else-if="verifiedCount" class="hint">
        ✓ {{ verifiedCount }} contribution{{ verifiedCount === 1 ? '' : 's' }} verified on the Nimiq
        blockchain — updates automatically as people pay.
      </p>
      <p v-else-if="synced" class="hint">
        Watching the Nimiq blockchain — contributions appear here automatically as people pay.
      </p>
      <ContributorList :contributions="collection.contributions" />
    </div>

    <router-link :to="`/c/${collection.id}`" class="btn btn-ghost">View as contributor</router-link>
    <button class="btn" :class="collection.status === 'open' ? 'btn-danger' : 'btn-ghost'" @click="toggleClosed">
      {{ collection.status === 'open' ? 'Close collection' : 'Reopen collection' }}
    </button>
  </div>
</template>

<style scoped>
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.status {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
}

.status.open {
  background: rgba(255, 93, 115, 0.14);
  color: var(--coral-dark);
}

.status.closed {
  background: rgba(43, 30, 20, 0.08);
  color: var(--text-soft);
}

.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.refresh {
  background: transparent;
  border: 1.5px solid var(--border);
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-soft);
  cursor: pointer;
  white-space: nowrap;
}

.refresh:disabled {
  opacity: 0.5;
  cursor: default;
}

.share-card {
  align-items: center;
  text-align: center;
}

.qr {
  width: min(240px, 70vw);
  height: auto;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.link-box {
  width: 100%;
  padding: 0.6rem 0.75rem;
  background: rgba(43, 30, 20, 0.05);
  border-radius: 8px;
  font-size: 0.72rem;
  word-break: break-all;
  cursor: pointer;
  max-height: 4.5em;
  overflow: hidden;
}

.share-buttons {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.share-buttons .btn {
  flex: 1;
}
</style>
