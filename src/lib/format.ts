/** Format a NIM amount for display: whole numbers stay whole, decimals trim to 2 digits. */
export function formatNim(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  return Number.isInteger(rounded)
    ? rounded.toLocaleString('en-US')
    : rounded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** "NQ07 0000 …" → "NQ07 0000…36KN" for compact display. */
export function shortAddress(address: string): string {
  const clean = address.trim()
  if (clean.length <= 14) return clean
  return `${clean.slice(0, 9)}…${clean.slice(-4)}`
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/** Basic sanity check for a user-friendly Nimiq address (NQ + 2 digits + 32 chars). */
export function isValidNimiqAddress(address: string): boolean {
  const clean = address.replace(/\s/g, '').toUpperCase()
  return /^NQ\d{2}[0-9A-Z]{32}$/.test(clean)
}
