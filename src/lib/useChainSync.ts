import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'
import type { Collection } from './types'
import { fetchChainContributions } from './chain'
import { mergeChainContributions } from './store'

/** How often to re-check the chain while a page is open. */
const POLL_MS = 20_000

/**
 * Keep a collection's contributions in sync with the blockchain.
 *
 * This is what makes the app work across devices: every viewer reads the same
 * on-chain truth instead of only what their own browser recorded.
 */
export function useChainSync(collection: Ref<Collection | undefined>, onUpdate: () => void) {
  const syncing = ref(false)
  const syncError = ref('')
  const lastSynced = ref(0)
  /** False until the first successful read, so the UI can avoid claiming "verified" prematurely. */
  const synced = ref(false)

  let timer = 0
  let disposed = false

  async function sync() {
    const c = collection.value
    if (!c || syncing.value) return
    syncing.value = true
    syncError.value = ''
    try {
      const chain = await fetchChainContributions(c.organizerAddress, c.id)
      if (disposed) return
      mergeChainContributions(c.id, chain)
      lastSynced.value = Date.now()
      synced.value = true
      onUpdate()
    } catch {
      if (!disposed) syncError.value = "Couldn't reach the Nimiq network — showing what this device knows."
    } finally {
      syncing.value = false
    }
  }

  onMounted(() => {
    sync()
    timer = window.setInterval(sync, POLL_MS)
  })

  onBeforeUnmount(() => {
    disposed = true
    clearInterval(timer)
  })

  return { sync, syncing, syncError, lastSynced, synced }
}
