export interface Contribution {
  contributorName?: string
  /** Amount in NIM (decimal). */
  amount: number
  /** Nimiq transaction hash, when paid through Nimiq Pay. */
  txHash?: string
  timestamp: number
  /**
   * Confirmed on the Nimiq blockchain (read back via the explorer), as opposed
   * to a locally-recorded or simulated payment.
   */
  verified?: boolean
}

export type CollectionStatus = 'open' | 'closed'

export interface Collection {
  /** Short unique ID (nanoid), used in the share URL. */
  id: string
  title: string
  description?: string
  /** Goal amount in NIM (decimal). */
  goalAmount: number
  /** Organizer's Nimiq address (NQ…) — where contributions are sent. */
  organizerAddress: string
  contributions: Contribution[]
  status: CollectionStatus
  createdAt: number
  /**
   * True when this device created the collection. Organizer-owned collections are
   * the source of truth and are never mutated by an incoming shared snapshot.
   */
  isOrganizer?: boolean
}
