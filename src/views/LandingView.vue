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

