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
4. **Track**: the organizer dashboard shows live progress, every contributor, a QR code, and a one-tap reminder message.

## Screens

| Route | Screen | What it does |
| --- | --- | --- |
| `/` | Landing | Product pitch: hero, what-it-is, how-to-use, CTA |
| `/create` | Create | Name, goal, optional message, organizer address (auto-filled from the wallet inside Nimiq Pay) |
| `/c/:id` | Collection | What contributors see: progress bar, quick amounts (5/10/20/50 NIM), custom amount, name for the wall, **Contribute** |
| `/c/:id/dashboard` | Dashboard | QR + share link, copy-reminder button, contributor list, close/reopen |
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
  recipient: collection.organizerAddress,     // 'NQ…'
  value: amountNim * 100_000,
  data: `Collect: ${collection.title}`,       // tags the tx on-chain (≤64 bytes)
})
```

Every contribution is a plain NIM transaction from the contributor directly to the organizer — Collect holds no funds, has no backend wallet, and can't lose anyone's money.

**Demo mode:** outside Nimiq Pay (a normal browser), `init()` times out gracefully and payments are simulated behind a confirmation dialog, so the entire flow can be tested end-to-end without a wallet.

## No backend — how sharing works anyway

Collections live in `localStorage`, but every share link carries a **base64url-encoded snapshot of the whole collection** in its `d` query param:

```
https://<host>/c/aB3xK9pQ?d=eyJpZCI6ImFCM3hLOXBRIiwidGl0bGUi…
```

When someone on another device opens the link, the app decodes the snapshot (goal, organizer address, contributions known at share time), imports it into local storage, and renders the page. Snapshots merge — contributions are never lost locally. The organizer's device is the source of truth; re-sharing the link refreshes everyone's snapshot.

For distribution inside Nimiq Pay, links are wrapped as deep links:

```
nimiqpay://miniapp?url=https://<host>/c/aB3xK9pQ?d=…
```

The dashboard QR code encodes exactly this, so scanning it opens the collection directly inside Nimiq Pay.

*Trade-off:* contributor views are snapshots, not live. A future version could sync via a lightweight backend or by watching the organizer address's incoming transactions on-chain — the tx `data` field already tags every contribution with its collection.

## Tech stack

- **Vite + Vue 3 + TypeScript** (strict), vue-router
- **`@nimiq/mini-app-sdk`** — provider init, `listAccounts`, `sendBasicTransactionWithData`
- **`@nimiq/style`** — Nimiq design-system base
- **`qrcode`** — dashboard QR generation
- **`nanoid`** — collection IDs
- No backend, no database, no env vars — deploys as a static site

## Project structure

```
src/
├── main.ts                    # app entry + routes
├── App.vue                    # shell: header, footer, full-bleed landing mode
├── style.css                  # design tokens (warm cream/coral theme) + shared UI
├── lib/
│   ├── types.ts               # Collection / Contribution models
│   ├── store.ts               # localStorage store + snapshot merge
│   ├── share.ts               # base64url snapshots, share URLs, deep links
│   ├── nimiq.ts               # SDK init, listAccounts, payNim (NIM→luna)
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

## Design

Warm, human, non-crypto look: cream `#FFF7EE` background, coral `#FF5D73` accent, dark-brown ink `#2B1E14`, Manrope typography. The progress bar is the hero of every screen — coral with a live shimmer, green when the goal is hit. Mobile-first (Nimiq Pay's WebView), responsive up to desktop for the landing page.

## License

[MIT](LICENSE)
