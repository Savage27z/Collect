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
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
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

/** Store a collection received via a shared link so the page survives reloads. */
export function importCollection(collection: Collection) {
  const existing = state.collections[collection.id]
  if (existing) {
    // Keep whichever side knows about more contributions; never lose local ones.
    const seen = new Set(existing.contributions.map(c => `${c.timestamp}:${c.amount}`))
    for (const c of collection.contributions) {
      if (!seen.has(`${c.timestamp}:${c.amount}`)) existing.contributions.push(c)
    }
    existing.status = collection.status
  } else {
    state.collections[collection.id] = collection
  }
  persist()
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
  return collection.contributions.reduce((sum, c) => sum + c.amount, 0)
}
