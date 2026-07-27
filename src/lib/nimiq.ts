import { ref, readonly } from 'vue'
import { init, type NimiqProvider } from '@nimiq/mini-app-sdk'

/**
 * Shared Nimiq Pay provider state, resolved once at app start.
 *
 * Inside Nimiq Pay, init() resolves with the injected provider. In a regular
 * browser it times out and the app falls back to demo mode (simulated
 * contributions) so the flow can still be tried end-to-end.
 */
const NIMIQ_INIT_TIMEOUT = 10_000

export const LUNA_PER_NIM = 100_000

const nimiqReady = ref(false)
const nimiqConnecting = ref(true)

const nimiqInit: Promise<NimiqProvider | null> = init({ timeout: NIMIQ_INIT_TIMEOUT })
  .then((provider) => {
    nimiqReady.value = true
    return provider
  })
  .catch(() => null)
  .finally(() => {
    nimiqConnecting.value = false
  })

async function getNimiq(): Promise<NimiqProvider> {
  const provider = await nimiqInit
  if (!provider) throw new Error('Nimiq provider not available — open this app inside Nimiq Pay')
  return provider
}

/** The user's default Nimiq address (first wallet account), or null outside Nimiq Pay. */
export async function getDefaultAddress(): Promise<string | null> {
  try {
    const provider = await nimiqInit
    if (!provider) return null
    const accounts = await provider.listAccounts()
    return accounts?.[0] ?? null
  } catch {
    return null
  }
}
