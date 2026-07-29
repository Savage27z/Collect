import type { Contribution } from './types'
import { LUNA_PER_NIM, clampToBytes } from './nimiq'

/**
 * On-chain contribution reading.
 *
 * Without a backend, a contributor's payment would otherwise never reach the
 * organizer's device — each browser only knows what it did itself. But every
 * contribution *is* a real Nimiq transaction to the organizer's address, tagged
 * in its data field, so the blockchain is the shared source of truth.
 *
 * Reading it back means the dashboard shows what actually happened rather than
 * what this device happens to remember, and nobody can fake a contribution they
 * never paid.
 */

/** Public, CORS-enabled Nimiq explorer API (read-only). */
const API_BASE = 'https://v2.nimiqwatch.com/api/v1'
const MEMO_PREFIX = 'CLCT'
/** Nimiq transaction data field limit. */
const MEMO_MAX_BYTES = 64

/**
 * Transaction memo: `CLCT:<collectionId>:<name>`.
 *
 * The id (not the title) identifies the collection — it is short, exact, and
 * immune to renames or emoji. Whatever budget is left carries the payer's name
 * so the organizer sees who paid, not just an address.
 */
export function buildMemo(collectionId: string, contributorName?: string): string {
  return clampToBytes(`${MEMO_PREFIX}:${collectionId}:${contributorName ?? ''}`, MEMO_MAX_BYTES)
}

export function parseMemo(text: string): { id: string; name?: string } | null {
  const prefix = `${MEMO_PREFIX}:`
  if (!text.startsWith(prefix)) return null
  const rest = text.slice(prefix.length)
  const sep = rest.indexOf(':')
  if (sep <= 0) return null
  const name = rest.slice(sep + 1).trim()
  return { id: rest.slice(0, sep), name: name || undefined }
}

/** The explorer returns transaction data as a hex string. */
function hexToUtf8(hex: string): string {
  if (!hex || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) return ''
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  try {
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return ''
  }
}

const normalize = (address: string) => address.replace(/\s/g, '').toUpperCase()

/**
 * Fetch confirmed contributions to a collection from the Nimiq blockchain.
 *
 * Only incoming, positive-value transactions whose memo names this collection
 * are counted. Throws if the explorer is unreachable so the caller can fall
 * back to locally-known state.
 */
export async function fetchChainContributions(
  organizerAddress: string,
  collectionId: string,
  max = 100
): Promise<Contribution[]> {
  const address = normalize(organizerAddress)
  const response = await fetch(`${API_BASE}/account-transactions/${address}/${max}`)
  if (!response.ok) throw new Error(`Explorer returned ${response.status}`)

  const rows: unknown = await response.json()
  if (!Array.isArray(rows)) return []

  const contributions: Contribution[] = []
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    const tx = row as Record<string, unknown>

    // Incoming only — ignore anything the organizer sent out.
    if (typeof tx.receiver_address !== 'string') continue
    if (normalize(tx.receiver_address) !== address) continue
    if (typeof tx.value !== 'number' || tx.value <= 0) continue

    const memo = parseMemo(hexToUtf8(typeof tx.data === 'string' ? tx.data : ''))
    if (!memo || memo.id !== collectionId) continue

    contributions.push({
      contributorName: memo.name,
      amount: tx.value / LUNA_PER_NIM,
      txHash: typeof tx.hash === 'string' ? tx.hash : undefined,
      timestamp: typeof tx.timestamp === 'number' ? tx.timestamp * 1000 : Date.now(),
      verified: true,
    })
  }
  return contributions
}

/** Block explorer link for a transaction, so contributions are auditable. */
export function explorerTxUrl(txHash: string): string {
  return `https://nimiq.watch/#${txHash}`
}
