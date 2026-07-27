import type { Collection } from './types'

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

export function decodeCollection(encoded: string): Collection | null {
  try {
    const parsed = JSON.parse(base64UrlDecode(encoded))
    if (typeof parsed?.id !== 'string' || typeof parsed?.title !== 'string') return null
    if (typeof parsed?.goalAmount !== 'number' || typeof parsed?.organizerAddress !== 'string') return null
    return {
      id: parsed.id,
      title: parsed.title,
      description: typeof parsed.description === 'string' ? parsed.description : undefined,
      goalAmount: parsed.goalAmount,
      organizerAddress: parsed.organizerAddress,
      contributions: Array.isArray(parsed.contributions) ? parsed.contributions : [],
      status: parsed.status === 'closed' ? 'closed' : 'open',
      createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
    }
  } catch {
    return null
  }
}

