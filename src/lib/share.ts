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

/**
 * Compact wire format. Share links get pasted into group chats and turned into
 * QR codes, so every character counts: keys are single letters, the id lives in
 * the URL path instead of the payload, the address drops its display spaces,
 * and anything at its default value is omitted entirely.
 */
interface CompactContribution {
  /** name */ n?: string
  /** amount */ m: number
  /** txHash */ h?: string
  /** timestamp */ t: number
}

interface CompactSnapshot {
  /** title */ t: string
  /** goal */ g: number
  /** address, no spaces */ a: string
  /** description */ d?: string
  /** contributions */ c?: CompactContribution[]
  /** closed */ x?: 1
}

/** Nimiq addresses display as 9 groups of 4 characters. */
function spaceAddress(address: string): string {
  const clean = address.replace(/\s/g, '').toUpperCase()
  return clean.match(/.{1,4}/g)?.join(' ') ?? clean
}

export function encodeCollection(collection: Collection): string {
  const snap: CompactSnapshot = {
    t: collection.title,
    g: collection.goalAmount,
    a: collection.organizerAddress.replace(/\s/g, ''),
  }
  if (collection.description) snap.d = collection.description
  if (collection.contributions.length) {
    snap.c = collection.contributions.map(c => {
      const out: CompactContribution = { m: c.amount, t: c.timestamp }
      if (c.contributorName) out.n = c.contributorName
      if (c.txHash) out.h = c.txHash
      return out
    })
  }
  if (collection.status === 'closed') snap.x = 1
  return base64UrlEncode(JSON.stringify(snap))
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
function sanitizeContribution(raw: unknown, isLegacy = false): Contribution | null {
  if (!raw || typeof raw !== 'object') return null
  const c = raw as Record<string, unknown>
  const amount = isLegacy ? c.amount : c.m
  const rawTime = isLegacy ? c.timestamp : c.t
  const rawName = isLegacy ? c.contributorName : c.n
  const rawHash = isLegacy ? c.txHash : c.h

  if (!finitePositive(amount)) return null
  const timestamp = typeof rawTime === 'number' && Number.isFinite(rawTime) ? rawTime : Date.now()
  const name = typeof rawName === 'string' ? rawName.slice(0, MAX_NAME) : undefined
  return {
    contributorName: name || undefined,
    amount,
    txHash: typeof rawHash === 'string' ? rawHash.slice(0, 128) : undefined,
    timestamp,
  }
}

/**
 * Decode a snapshot from a share link. `id` comes from the URL path, not the
 * payload, so the caller passes it in.
 *
 * Accepts the compact format and the original long-form one (links already
 * shared in the wild must keep working).
 */
export function decodeCollection(encoded: string, id: string): Collection | null {
  try {
    // `id` becomes an object key in the store — reject '__proto__' and friends.
    if (!isValidId(id)) return null
    const parsed = JSON.parse(base64UrlDecode(encoded))
    if (!parsed || typeof parsed !== 'object') return null

    // Long-form links carry their own id; it must match the path.
    const isLegacy = typeof parsed.title === 'string' || typeof parsed.id === 'string'
    if (isLegacy && parsed.id !== id) return null

    const title = isLegacy ? parsed.title : parsed.t
    const goalAmount = isLegacy ? parsed.goalAmount : parsed.g
    const address = isLegacy ? parsed.organizerAddress : parsed.a
    const description = isLegacy ? parsed.description : parsed.d
    const rawContributions = isLegacy ? parsed.contributions : parsed.c
    const closed = isLegacy ? parsed.status === 'closed' : parsed.x === 1

    if (typeof title !== 'string' || !title.trim()) return null
    if (!finitePositive(goalAmount)) return null
    // The organizer address is the payment recipient — never accept a free-form string.
    if (typeof address !== 'string' || !isValidNimiqAddress(address)) return null

    const contributions = Array.isArray(rawContributions)
      ? (rawContributions as unknown[])
          .map(raw => sanitizeContribution(raw, isLegacy))
          .filter((c): c is Contribution => c !== null)
      : []

    return {
      id,
      title: title.slice(0, MAX_TITLE),
      description:
        typeof description === 'string' ? description.slice(0, MAX_DESCRIPTION) : undefined,
      goalAmount,
      organizerAddress: spaceAddress(address),
      contributions,
      status: closed ? 'closed' : 'open',
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
