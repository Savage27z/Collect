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

