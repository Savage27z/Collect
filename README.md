# Collect 💸

**Group payment collections powered by Nimiq Pay.** One link, one tap, everyone chips in.

Collect is a [Nimiq Mini App](https://nimiq.dev/mini-apps/) that lets anyone spin up a shared money collection for a group event — a birthday gift, a farewell fund, a team lunch, a wedding pool — and share a single link. Everyone who opens it sees the goal, the live progress bar, and who has already paid, and contributes their share with one tap inside Nimiq Pay.

> **One-liner:** GoFundMe for private group collections — zero fees, instant settlement, no accounts.

Built for the [Nimiq Mini Apps Competition](https://miniappscompetition.com) (Cycle II). MIT licensed.

---

## The problem

Collecting money from a group in real life is universally broken:

- One person fronts the cash and then chases everyone individually for weeks
- Venmo/PayPal need accounts, friend requests, and take fees
- "Who has paid?" lives in group-chat screenshots and mental notes
- Asking friends for money is socially awkward — every reminder costs goodwill

## The fix

1. **Create** a collection: name + goal in NIM. Takes ten seconds.
2. **Share** one link in the group chat. It opens straight inside Nimiq Pay — no installs, no sign-ups.
3. **Collect**: each person taps *Contribute*, approves the payment in Nimiq Pay's native dialog, and lands on the contributor wall. Funds settle **peer-to-peer into the organizer's wallet, instantly, with zero fees** — the app never touches the money.
4. **Track**: the organizer dashboard reads contributions **straight off the Nimiq blockchain**, so it shows who actually paid — from any device, verifiable, impossible to fake — plus a QR code and a one-tap reminder message.

No server is involved at any step. The chain is the database.

## Screens

| Route | Screen | What it does |
| --- | --- | --- |
| `/` | Landing | Product pitch: hero, what-it-is, how-to-use, CTA |
| `/create` | Create | Name, goal, optional message, organizer address (auto-filled from the wallet inside Nimiq Pay) |
| `/c/:id` | Collection | What contributors see: progress bar, quick amounts (5/10/20/50 NIM), custom amount, name for the wall, **Contribute** |
| `/c/:id/dashboard` | Dashboard | QR + share link, copy-reminder button, on-chain contributor list, close/reopen |
| `/collections` | My collections | Every collection created on this device, with mini progress bars |

## How the payment works

Inside Nimiq Pay, the wallet injects a provider that the [`@nimiq/mini-app-sdk`](https://www.npmjs.com/package/@nimiq/mini-app-sdk) resolves:

```ts
import { init } from '@nimiq/mini-app-sdk'

const nimiq = await init({ timeout: 10_000 })

// Organizer address auto-fill on the create screen
const accounts = await nimiq.listAccounts()   // ['NQ…']

// Contribution — value is in luna (1 NIM = 100,000 luna)
const txHash = await nimiq.sendBasicTransactionWithData({
  recipient: collection.organizerAddress,       // 'NQ…'
  value: amountNim * 100_000,
  data: `CLCT:${collection.id}:${name}`,        // ≤64 bytes, byte-safe truncation
})
```

The memo is what makes contributions readable back off the chain later — see
[the blockchain is the database](#no-backend--the-blockchain-is-the-database).

Every contribution is a plain NIM transaction from the contributor directly to the organizer — Collect holds no funds, has no backend wallet, and can't lose anyone's money.

**Demo mode:** outside Nimiq Pay (a normal browser), `init()` times out gracefully and payments are simulated behind a confirmation dialog, so the entire flow can be tested end-to-end without a wallet.

## No backend — the blockchain is the database

Collect has no server, no database, and no account system. It stays in sync using two mechanisms:

### 1. The link carries the collection

Every share link embeds a compact, base64url-encoded snapshot in its `d` query param — title, goal, and organizer address:

```
https://<host>/c/aB3xK9pQ?d=eyJ0IjoiRm9yIGlkcmlzIiwiZyI6MTAsImEiOiJOUTQ3…
```

Anyone opening the link gets the collection without ever contacting a server. Snapshots are treated as untrusted input and fully validated on arrival (see [Security](#security)).

### 2. The chain carries the contributions

Contributions are **read back from the Nimiq blockchain**, not from local storage. Each payment is tagged in its transaction data field:

```
CLCT:<collectionId>:<contributorName>
```

The app queries the organizer's address via a public, CORS-enabled explorer API, keeps transactions whose memo names this collection, and renders them as the contributor wall — polling every 20s.

This is what makes the app actually work with more than one device: when Bob pays from his phone, Alice's dashboard sees it, because both are reading the same chain. It also means **contributions cannot be faked** — a name only appears on the wall if a real transaction paid for it, and every entry links to the block explorer.

Locally-simulated (demo mode) entries are kept separate and clearly labelled `demo`, never mixed into verified totals.

### Distribution

For sharing inside Nimiq Pay, links are wrapped as deep links — this is what the dashboard QR code encodes:

```
nimiqpay://miniapp?url=https://<host>/c/aB3xK9pQ?d=…
```

*Remaining limitation:* the goal and title still live in the link rather than on-chain, so an organizer who changes them must re-share. Contribution data — the part that matters — is always live.

## Tech stack

- **Vite + Vue 3 + TypeScript** (strict), vue-router
- **`@nimiq/mini-app-sdk`** — provider init, `listAccounts`, `sendBasicTransactionWithData`
- **`@nimiq/style`** — Nimiq design-system base
- **`qrcode`** — dashboard QR generation
- **`nanoid`** — collection IDs
- **Public Nimiq explorer API** — reads confirmed contributions back off-chain
- No backend, no database, no env vars — deploys as a static site

## Project structure

```
src/
├── main.ts                    # app entry + routes
├── App.vue                    # shell: header, footer, full-bleed landing mode
├── style.css                  # design tokens (warm cream/coral theme) + shared UI
├── lib/
│   ├── types.ts               # Collection / Contribution models
│   ├── store.ts               # localStorage store + chain merge
│   ├── share.ts               # compact snapshots, share URLs, deep links
│   ├── nimiq.ts               # SDK init, listAccounts, payNim (NIM→luna)
│   ├── chain.ts               # on-chain contribution reading + tx memos
│   ├── useChainSync.ts        # keeps a collection synced with the blockchain
│   └── format.ts              # NIM formatting, NQ-address validation, time-ago
├── components/
│   ├── ProgressBar.vue        # animated coral progress + shimmer
│   └── ContributorList.vue    # the contributor wall
└── views/
    ├── LandingView.vue        # 4-section landing (hero / what / how / CTA)
    ├── CreateView.vue
    ├── CollectionView.vue     # contributor page + payment flow
    ├── DashboardView.vue      # organizer: QR, share, remind, close
    └── CollectionsView.vue
```

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 — demo mode works in any browser. To test with real payments, expose the dev server on your LAN (`vite --host` is already configured), then open `nimiqpay://miniapp?url=http://<your-lan-ip>:5173` on a phone with Nimiq Pay installed.

## Build & deploy

```bash
npm run build   # vue-tsc type-check + vite build → dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages). One requirement: **SPA rewrites** — unknown paths like `/c/abc123` must serve `index.html` (on Vercel/Netlify this is a one-line rewrite rule).

## Security

Share links are attacker-controllable — anyone who receives one can edit it — so every snapshot is treated as hostile input. The app was audited against OWASP Top 10:2025 and hardened accordingly:

- **The payment recipient is validated** against the Nimiq address format before it can ever reach the wallet. A link with a swapped or malformed address is rejected outright, not paid.
- **Address-change warning:** if a link names a different recipient than one previously seen for that collection, the app refuses to apply it and warns the user.
- **Collections you created are never mutated by an incoming link** — no injecting fake contributions or force-closing someone else's collection.
- **Every snapshot field is bounds-checked**: ids are pattern-matched (blocking `__proto__` prototype pollution), amounts must be finite and positive, strings are length-clamped, malformed contributions are dropped.
- **Contributions are verified on-chain**, so the wall can't be padded with payments nobody made.
- **Transaction memos are truncated by byte length, not character count** — an emoji title would otherwise overflow Nimiq's 64-byte data field and break the payment.
- **CSP and hardening headers** ship with the deployment ([vercel.json](vercel.json)).
- No secrets, no API keys, no private keys — signing happens entirely inside Nimiq Pay.

## Design

Warm, human, non-crypto look: cream `#FFF7EE` background, coral `#FF5D73` accent, dark-brown ink `#2B1E14`, Manrope typography. The progress bar is the hero of every screen — coral with a live shimmer, green when the goal is hit. Mobile-first (Nimiq Pay's WebView), responsive up to desktop for the landing page.

## License

[MIT](LICENSE)
