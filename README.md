# Collect 💸

**Group payment collections powered by Nimiq Pay.** One link, one tap, everyone chips in.

GoFundMe for private group collections — birthday gifts, farewell funds, team lunches, wedding funds — with zero fees and instant settlement.

Built for the [Nimiq Mini Apps Competition](https://miniappscompetition.com).

## How it works

1. **Create** — name your collection, set a goal in NIM, get a share link.
2. **Share** — send the link (or QR) to your group chat. It opens straight inside Nimiq Pay via `nimiqpay://miniapp?url=…`.
3. **Collect** — each person sees the goal and progress, taps **Contribute**, and approves the payment in Nimiq Pay. Funds land in the organizer's wallet instantly, fee-free.
4. **Track** — the organizer dashboard shows live progress, the contributor wall, a copyable reminder message, and a close button.

## Why Nimiq Pay

- **No accounts for payers** — open link → approve payment. Done.
- **Instant settlement** — no 2-day payout delays.
- **Near-zero fees** — crypto-native.
- **Payments go peer-to-peer** — directly from contributor to organizer; the app never touches funds.

## Tech

- Vite + Vue 3 + TypeScript
- [`@nimiq/mini-app-sdk`](https://nimiq.dev/mini-apps/) — provider init, `listAccounts`, `sendBasicTransactionWithData`
- [`@nimiq/style`](https://nimiq.github.io/nimiq-style/) — Nimiq design system
- No backend: collections live in localStorage, and every share link carries a
  base64url snapshot of the collection (`?d=…`) so contributors on other
  devices see the goal, organizer address, and contributor wall.

## Run it

```bash
npm install
npm run dev
```

Outside Nimiq Pay the app runs in **demo mode** — payments are simulated so the full flow can be tested in any browser. Inside Nimiq Pay, real NIM transactions are sent with the collection name attached as on-chain data.

## Build

```bash
npm run build
```

Deploys as a static site (Vercel / Netlify / GitHub Pages). For SPA routing, make sure unknown paths rewrite to `index.html`.

## License

[MIT](LICENSE)
