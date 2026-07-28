import type { Collection, Contribution } from './types'
import { isValidNimiqAddress } from './format'

/**
 * Share links carry a compact snapshot of the collection in the URL itself
 * (base64url-encoded JSON in the `d` query param). This is what makes the
 * no-backend MVP work across devices: a contributor opening the link sees the
 * goal, organizer address, and the contributions known when the link was made.
 */

function base64UrlEncode(json: string): string {
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeCollection(collection: Collection): string {
  return base64UrlEncode(JSON.stringify(collection))
}

/** Collection ids are nanoid-shaped; anything else is a crafted link. */
const ID_PATTERN = /^[A-Za-z0-9_-]{6,16}$/
/** These match ID_PATTERN but are unsafe as object keys in the store. */
const RESERVED_IDS = new Set(['__proto__', 'constructor', 'prototype'])

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && ID_PATTERN.test(id) && !RESERVED_IDS.has(id)
}

const MAX_TITLE = 60
const MAX_DESCRIPTION = 200
const MAX_NAME = 30
/** Sanity ceiling so a crafted goal can't produce absurd progress math. */
const MAX_AMOUNT = 1_000_000_000

function finitePositive(value: unknown, max = MAX_AMOUNT): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= max
}

/**
 * Snapshots arrive from the URL, so every field is attacker-controlled: validate
 * each one and drop anything malformed rather than trusting the payload.
 */
function sanitizeContribution(raw: unknown): Contribution | null {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Record<string, unknown>
  if (!finitePositive(c.amount)) return null
  const timestamp =
    typeof c.timestamp === 'number' && Number.isFinite(c.timestamp) ? c.timestamp : Date.now()
  const name = typeof c.contributorName === 'string' ? c.contributorName.slice(0, MAX_NAME) : undefined
  return {
    contributorName: name || undefined,
    amount: c.amount,
    txHash: typeof c.txHash === 'string' ? c.txHash.slice(0, 128) : undefined,
    timestamp,
  }
}

export function decodeCollection(encoded: string): Collection | null {
  try {
    const parsed = JSON.parse(base64UrlDecode(encoded))
    if (!parsed || typeof parsed !== 'object') return null
    // `id` becomes an object key in the store — reject '__proto__' and friends.
    if (!isValidId(parsed.id)) return null
    if (typeof parsed.title !== 'string' || !parsed.title.trim()) return null
    if (!finitePositive(parsed.goalAmount)) return null
    // The organizer address is the payment recipient — never accept a free-form string.
    if (typeof parsed.organizerAddress !== 'string' || !isValidNimiqAddress(parsed.organizerAddress)) {
      return null
    }
    const contributions = Array.isArray(parsed.contributions)
      ? (parsed.contributions as unknown[])
          .map(sanitizeContribution)
          .filter((c): c is Contribution => c !== null)
      : []
    return {
      id: parsed.id,
      title: parsed.title.slice(0, MAX_TITLE),
      description:
        typeof parsed.description === 'string' ? parsed.description.slice(0, MAX_DESCRIPTION) : undefined,
      goalAmount: parsed.goalAmount,
      organizerAddress: parsed.organizerAddress,
      contributions,
      status: parsed.status === 'closed' ? 'closed' : 'open',
      createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
    }
  } catch {
    return null
  }
}

/** Plain https URL for the collection page, snapshot included. */
export function collectionUrl(collection: Collection): string {
  return `${location.origin}/c/${collection.id}?d=${encodeCollection(collection)}`
}

/** Deep link that opens the collection inside Nimiq Pay. */
export function deepLink(collection: Collection): string {
  return `nimiqpay://miniapp?url=${encodeURIComponent(collectionUrl(collection))}`
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
