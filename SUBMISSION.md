# Submission materials

## Description (243 words)

**Collect — group payment collections, verified on-chain.**

Organising a group gift is a broken experience. One person fronts the money, then spends two weeks chasing everyone. Venmo and PayPal want accounts, friend requests, and fees. Tracking who actually paid means scrolling back through a group chat. Asking friends for money is awkward, and every reminder costs goodwill.

Collect replaces all of that with one link.

Create a collection — a name and a goal in NIM — and share the link in your group chat. It opens directly inside Nimiq Pay. Each person sees the goal, live progress, and who has contributed, then pays their share in a single tap. Funds settle peer-to-peer into the organiser's wallet instantly, with near-zero fees. The app never touches the money.

The interesting part is what replaces the backend. Collect has no server and no database. Each payment carries a memo in its Nimiq transaction data field identifying the collection and the payer, and the app reads those transactions back from the chain. That means the organiser's dashboard shows who really paid — from any device, updating live — and contributions cannot be faked, because a name only appears on the wall if a real transaction paid for it. Every entry links to the block explorer.

Nimiq turns out to be unusually well suited to this: instant settlement, negligible fees, and no onboarding for the payer. A group collection is exactly the case where those three things matter at once.

Live: https://collect-nimiq.vercel.app
Code: https://github.com/Savage27z/Collect (MIT)

---

## Demo script (90 seconds)

**0:00 — The problem (10s)**
Landing page on screen.
> "Everyone's organised a group gift. One person pays, then chases everyone for weeks. Collect fixes that with one link."

**0:10 — Create (15s)**
Tap *Start a collection* → type "Sarah's Birthday Gift" → goal 150 NIM.
> "Name it, set a goal. The organiser's wallet address fills in automatically from Nimiq Pay."
Tap *Create Collection Link*.

**0:25 — Share (15s)**
Dashboard appears with QR + link.
> "You get a link and a QR code. Drop it in the group chat — it opens straight inside Nimiq Pay. No installs, no sign-ups, no accounts."

**0:40 — Contribute (20s)**
Second device (or second window) opens the link.
> "Bob opens the link, sees the goal and how far along it is, picks an amount, and taps Contribute."
Approve in Nimiq Pay's dialog.
> "That's a real NIM transaction, peer-to-peer, settled instantly."

**1:00 — The payoff (20s)**
Switch back to the organiser's dashboard — Bob appears.
> "And here's the part that matters: the organiser's dashboard just updated — on a different device, with no backend. Collect reads contributions straight off the Nimiq blockchain. Every entry is verified, links to the block explorer, and can't be faked."

**1:20 — Close (10s)**
> "No server. No database. No accounts. No fees. The chain is the database. That's Collect."

---

## Checklist

- [x] Public GitHub repo
- [x] MIT License
- [x] Built on the Nimiq Pay Mini Apps framework (`@nimiq/mini-app-sdk`)
- [x] NIM support (eligible for bonus points)
- [x] No hardcoded keys or secrets
- [x] Fully functional — works across devices, not a prototype
- [x] Deployed and publicly reachable
- [x] Description under 250 words
- [ ] Demo video recorded
- [ ] Submitted (cycle opens Aug 10)

## Open question for the organisers

The rules don't state whether projects must be *built* during the cycle window or may pre-date it. Worth confirming before submitting, since this repo is timestamped before Cycle II opens.
