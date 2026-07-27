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
    return Array.isArray(accounts) ? accounts[0] ?? null : null
  } catch {
    return null
  }
}

export function nimToLuna(nim: number): number {
  return Math.round(nim * LUNA_PER_NIM)
}

/**
 * Ask Nimiq Pay to send `amountNim` NIM to `recipient`. The native app shows
 * its confirmation dialog; resolves with the transaction hash.
 */
export async function payNim(recipient: string, amountNim: number, reference: string): Promise<string> {
  const provider = await getNimiq()
  // The data field (max 64 bytes) tags the transaction with the collection name.
  const data = reference.slice(0, 64)
  const result = await provider.sendBasicTransactionWithData({
    recipient,
    value: nimToLuna(amountNim),
    data,
  })
  if (typeof result === 'string') return result
  return (result as any)?.transactionHash ?? (result as any)?.hash ?? JSON.stringify(result)
}

export function useNimiq() {
  return {
    nimiqReady: readonly(nimiqReady),
    nimiqConnecting: readonly(nimiqConnecting),
    getNimiq,
  }
}
