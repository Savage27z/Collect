<script setup lang="ts">
import { allCollections } from '../lib/store'

const hasCollections = allCollections().length > 0
</script>

<template>
  <div class="stack landing">
    <section class="hero">
      <div class="badge">Runs inside Nimiq Pay</div>
      <h1 class="headline">
        Collect money from your group,<br />
        <span class="accent">without the awkward part.</span>
      </h1>
      <p class="tagline">
        Birthday gift, farewell fund, team lunch — create one link, drop it in
        the group chat, and everyone pays their share with one tap.
      </p>
      <router-link to="/create" class="btn btn-gold cta">🎁 Start a collection</router-link>
      <router-link v-if="hasCollections" to="/collections" class="btn btn-ghost">My collections</router-link>
    </section>

    <section class="demo-card card">
      <div class="demo-title">Sarah's Birthday Gift</div>
      <div class="demo-bar"><span class="demo-fill" /></div>
      <div class="demo-meta"><strong>120 NIM</strong> of 150 NIM · 5 contributors</div>
      <div class="demo-row">
        <span class="demo-avatar">B</span>
        <span class="demo-name">Bob chipped in</span>
        <span class="demo-amount">+20 NIM</span>
      </div>
    </section>

    <section class="steps">
      <div class="step">
        <span class="step-num">1</span>
        <div>
          <h2>Create a collection</h2>
          <p>Name it, set a goal in NIM. Takes ten seconds.</p>
        </div>
      </div>
      <div class="step">
        <span class="step-num">2</span>
        <div>
          <h2>Share one link</h2>
          <p>WhatsApp, Telegram, anywhere. It opens straight inside Nimiq Pay — no app installs, no sign-ups.</p>
        </div>
      </div>
      <div class="step">
        <span class="step-num">3</span>
        <div>
          <h2>Everyone taps to pay</h2>
          <p>Payments go peer-to-peer to your wallet. Instantly, with zero fees. Watch the bar fill up.</p>
        </div>
      </div>
    </section>

    <section class="uses">
      <span>🎂 Birthday gifts</span>
      <span>✈️ Farewells</span>
      <span>🍕 Team lunches</span>
      <span>💍 Wedding funds</span>
      <span>🎉 Bachelor parties</span>
    </section>

    <section class="bottom-cta">
      <router-link to="/create" class="btn btn-gold">Start collecting</router-link>
      <p class="hint">No accounts. No fees. No chasing people for money.</p>
    </section>
  </div>
</template>

<style scoped>
.landing {
  gap: 1.75rem;
  padding-top: 0.5rem;
}

.hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.badge {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--nimiq-light-blue);
  background: rgba(5, 130, 202, 0.09);
  border: 1px solid rgba(5, 130, 202, 0.25);
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
}

.headline {
  font-size: 1.75rem;
  line-height: 1.2;
}

.accent {
  background: linear-gradient(90deg, #0582ca, #21bca5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tagline {
  color: var(--text-soft);
  font-size: 0.98rem;
  line-height: 1.55;
  margin: 0;
  max-width: 34ch;
}

.cta {
  font-size: 1.05rem;
  max-width: 20rem;
}

.hero .btn-ghost {
  max-width: 20rem;
}

/* Fake preview card showing the product in action */
.demo-card {
  pointer-events: none;
  user-select: none;
}

.demo-title {
  font-weight: 800;
  margin-bottom: 0.6rem;
}

.demo-bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(31, 35, 72, 0.08);
  overflow: hidden;
}

.demo-fill {
  display: block;
  height: 100%;
  width: 80%;
  border-radius: 999px;
  background: linear-gradient(90deg, #0582ca, #265dd7);
  animation: fill-in 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes fill-in {
  from { width: 0; }
}

.demo-meta {
  font-size: 0.85rem;
  color: var(--text-soft);
  margin: 0.5rem 0 0.9rem;
}

.demo-meta strong {
  color: var(--text);
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
}

.demo-avatar {
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 50%;
  background: #0582ca;
  color: #fff;
  font-weight: 800;
  font-size: 0.85rem;
}

.demo-name {
  flex: 1;
  font-weight: 700;
}

.demo-amount {
  font-weight: 800;
  color: var(--nimiq-green);
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.step {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
}

.step-num {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--nimiq-blue);
  color: var(--nimiq-gold);
  font-weight: 800;
  flex-shrink: 0;
}

.step h2 {
  margin-bottom: 0.2rem;
}

.step p {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.9rem;
  line-height: 1.5;
}

.uses {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.uses span {
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  background: var(--card);
  border: 1px solid var(--border);
}

.bottom-cta {
  text-align: center;
}

.bottom-cta .hint {
  margin-top: 0.6rem;
}
</style>
