import { reactive } from 'vue'
import { nanoid } from 'nanoid'
import type { Collection, Contribution } from './types'

/**
 * Client-side collection store (MVP: no backend).
 *
 * Collections live in localStorage under one key. The device that created a
 * collection is the source of truth; contributors opening the shared link see
 * the snapshot encoded in the URL (see share.ts) merged with anything stored
 * locally.
 */
const STORAGE_KEY = 'collect:collections'

function load(): Record<string, Collection> {
  // Null-prototype: collection ids are used as keys, so a stored '__proto__' key
  // must never reach Object.prototype.
  const empty = () => Object.create(null) as Record<string, Collection>
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return empty()
    const store = empty()
    for (const [id, collection] of Object.entries(parsed)) {
      if (id === '__proto__' || id === 'constructor' || id === 'prototype') continue
      store[id] = collection as Collection
    }
    return store
  } catch {
    return empty()
  }
}

const state = reactive<{ collections: Record<string, Collection> }>({
  collections: load(),
})

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.collections))
}

export function createCollection(input: {
  title: string
  description?: string
  goalAmount: number
  organizerAddress: string
}): Collection {
  const collection: Collection = {
    id: nanoid(8),
    title: input.title,
    description: input.description || undefined,
    goalAmount: input.goalAmount,
    organizerAddress: input.organizerAddress,
    contributions: [],
    status: 'open',
    createdAt: Date.now(),
    isOrganizer: true,
  }
  state.collections[collection.id] = collection
  persist()
  return collection
}

export function getCollection(id: string): Collection | undefined {
  return state.collections[id]
}

export function allCollections(): Collection[] {
  return Object.values(state.collections).sort((a, b) => b.createdAt - a.createdAt)
}

export interface ImportResult {
  /** The snapshot was ignored because this device owns the collection. */
  ignored: boolean
  /** A stored collection with this id names a different payment recipient. */
  addressMismatch: boolean
}

/**
 * Store a collection received via a shared link so the page survives reloads.
 *
 * Snapshots are untrusted: a link can be edited by anyone who receives it. So a
 * collection this device created is never modified by an incoming snapshot, and a
 * changed organizer address on an existing collection is surfaced, not applied.
 */
export function importCollection(collection: Collection): ImportResult {
  const existing = state.collections[collection.id]
  if (!existing) {
    state.collections[collection.id] = { ...collection, isOrganizer: false }
    persist()
    return { ignored: false, addressMismatch: false }
  }

  if (existing.isOrganizer) {
    // We are the organizer — our local state is authoritative.
    return { ignored: true, addressMismatch: false }
  }

  const addressMismatch = existing.organizerAddress !== collection.organizerAddress
  if (addressMismatch) {
    // Someone re-shared this collection pointing at a different wallet. Keep the
    // address we saw first and let the UI warn the user.
    return { ignored: true, addressMismatch: true }
  }

  // Same collection, same recipient: merge in contributions we haven't seen.
  const seen = new Set(existing.contributions.map(c => `${c.timestamp}:${c.amount}`))
  for (const c of collection.contributions) {
    if (!seen.has(`${c.timestamp}:${c.amount}`)) existing.contributions.push(c)
  }
  existing.status = collection.status
  persist()
  return { ignored: false, addressMismatch: false }
}

export function addContribution(id: string, contribution: Contribution) {
  const collection = state.collections[id]
  if (!collection) return
  collection.contributions.push(contribution)
  persist()
}

export function setStatus(id: string, status: Collection['status']) {
  const collection = state.collections[id]
  if (!collection) return
  collection.status = status
  persist()
}

export function raisedAmount(collection: Collection): number {
  return collection.contributions.reduce(
    (sum, c) => (typeof c.amount === 'number' && Number.isFinite(c.amount) ? sum + c.amount : sum),
    0
  )
}
