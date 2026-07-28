import { ref, readonly } from 'vue'
import { init, type NimiqProvider } from '@nimiq/mini-app-sdk'
import { isValidNimiqAddress } from './format'

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

/** Smallest contribution we accept — below this the luna value rounds to zero. */
export const MIN_CONTRIBUTION_NIM = 0.01
/** Upper bound so a mistyped amount can't reach the wallet dialog unchallenged. */
export const MAX_CONTRIBUTION_NIM = 1_000_000

export function nimToLuna(nim: number): number {
  return Math.round(nim * LUNA_PER_NIM)
}

/**
 * Nimiq's transaction data field holds 64 *bytes*. Truncating by string length
 * would overflow it for any non-ASCII title (an emoji is 4 bytes), so clamp on
 * the encoded byte length and never split a character.
 */
export function clampToBytes(text: string, maxBytes = 64): string {
  const encoder = new TextEncoder()
  if (encoder.encode(text).length <= maxBytes) return text
  let out = ''
  for (const char of text) {
    if (encoder.encode(out + char).length > maxBytes) break
    out += char
  }
  return out
}

/**
 * Ask Nimiq Pay to send `amountNim` NIM to `recipient`. The native app shows
 * its confirmation dialog; resolves with the transaction hash.
 */
export async function payNim(recipient: string, amountNim: number, reference: string): Promise<string> {
  // Never hand an unvalidated recipient or amount to the wallet.
  if (!isValidNimiqAddress(recipient)) {
    throw new Error('This collection has an invalid payment address — do not pay it.')
  }
  if (!Number.isFinite(amountNim) || amountNim < MIN_CONTRIBUTION_NIM || amountNim > MAX_CONTRIBUTION_NIM) {
    throw new Error(`Enter an amount between ${MIN_CONTRIBUTION_NIM} and ${MAX_CONTRIBUTION_NIM} NIM.`)
  }
  const provider = await getNimiq()
  // The data field tags the transaction with the collection name (64 bytes max).
  const data = clampToBytes(reference, 64)
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
