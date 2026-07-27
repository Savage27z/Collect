<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Scroll-reveal: sections fade/slide in the first time they enter the viewport.
const whatRef = ref<HTMLElement | null>(null)
const howRef = ref<HTMLElement | null>(null)
const revealed = ref<Record<string, boolean>>({ what: false, how: false })

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const key = (entry.target as HTMLElement).dataset.reveal!
          revealed.value[key] = true
          observer?.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.2 }
  )
  for (const el of [whatRef.value, howRef.value]) {
    if (el) observer.observe(el)
  }
})

onBeforeUnmount(() => observer?.disconnect())

const steps = [
  { num: '1', title: 'Create a collection', body: 'Name it and set a goal — takes about ten seconds.' },
  { num: '2', title: 'Share one link', body: 'Drop it in the group chat. Opens straight inside Nimiq Pay — no installs, no sign-ups.' },
  { num: '3', title: 'Everyone taps to pay', body: 'Money lands in your wallet instantly, with zero fees.' },
]
</script>

<template>
  <div class="landing">
    <!-- 1. HERO -->
    <section class="hero">
      <div class="hero-grid reveal shown">
        <div>
          <div class="badge">Runs inside Nimiq Pay</div>
          <div class="kicker">Collect</div>
          <h1>Collect money from your group. No awkward chasing.</h1>
          <p class="sub">
            Start a shared collection, drop one link in the group chat, and
            everyone pays their share in a single tap.
          </p>
          <router-link to="/create" class="cta cta-coral">Start a collection</router-link>
        </div>

        <div class="float-stage">
          <div class="float-card float-notify">
            <div class="notify-row">
              <div class="notify-icon">🎁</div>
              <div class="notify-text">
                <div class="notify-title">Payment received</div>
                <div class="notify-sub">+20 NIM from Bob</div>
              </div>
            </div>
          </div>

          <div class="float-card float-progress">
            <div class="mini-label">SARAH'S BIRTHDAY GIFT</div>
            <div class="track">
              <div class="fill" style="width: 80%"><span class="shimmer" /></div>
            </div>
            <div class="mini-amount">120 / 150 NIM</div>
            <div class="mini-sub">5 contributors</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. WHAT IT IS -->
    <section class="what">
      <div ref="whatRef" data-reveal="what" class="what-grid reveal" :class="{ shown: revealed.what }">
        <div class="what-copy">
          <div class="eyebrow">WHAT IT IS</div>
          <h2>One link. Everyone pays their part.</h2>
          <p>
            Set a goal, share the link, and every tap from a friend nudges the
            bar closer to done — no spreadsheets, no IOUs.
          </p>
        </div>

        <div class="demo-card">
          <div class="demo-head">
            <div class="demo-titles">
              <span class="demo-title">Sarah's Birthday Gift</span>
              <span class="demo-sub">5 contributors</span>
            </div>
            <div class="demo-icon">🎁</div>
          </div>

          <div class="demo-progress">
            <div class="track track-lg">
              <div class="fill" style="width: 80%"><span class="shimmer" /></div>
            </div>
            <div class="demo-numbers">
              <span>120 NIM raised</span>
              <span class="soft">of 150 NIM</span>
            </div>
          </div>

          <div class="divider" />

          <div class="demo-row">
            <div class="demo-avatar">B</div>
            <div class="demo-who">
              <span class="demo-name">Bob chipped in <em>+20 NIM</em></span>
              <span class="demo-when">just now</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. HOW TO USE -->
    <section class="how">
      <div ref="howRef" data-reveal="how" class="how-inner reveal" :class="{ shown: revealed.how }">
        <div class="eyebrow">HOW TO USE</div>
        <h2>Three taps, zero awkwardness</h2>
        <div class="steps">
          <div v-for="step in steps" :key="step.num" class="step-card">
            <div class="step-num">{{ step.num }}</div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. FOOTER CTA -->
    <section class="footer-cta">
      <div class="footer-inner">
        <h2>Ready to stop chasing people for money?</h2>
        <router-link to="/create" class="cta cta-white">Start a collection</router-link>
        <p class="footer-line">No accounts. No fees. No chasing people for money.</p>
        <div class="footer-rule" />
        <span class="footer-credit">Powered by Nimiq Pay</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing {
  font-family: 'Manrope', 'Muli', system-ui, sans-serif;
  background: #fff7ee;
  color: #2b1e14;
  overflow-x: hidden;
}

/* Shared */
.reveal {
  opacity: 0;
  transform: translateY(30px) scale(0.97);
  transition: opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.reveal.shown {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.eyebrow {
  font-weight: 800;
  font-size: 13px;
  color: #e14a61;
  letter-spacing: 0.08em;
  margin-bottom: 20px;
}

.cta {
  display: inline-block;
  font-weight: 800;
  font-size: 16px;
  padding: 18px 36px;
  border-radius: 999px;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
}

.cta:hover {
  transform: translateY(-3px) scale(1.04);
  text-decoration: none;
}

.cta:active {
  transform: scale(0.96);
}

.cta-coral {
  background: #ff5d73;
  color: #fff;
  box-shadow: 0 10px 26px rgba(255, 93, 115, 0.35);
}

.cta-coral:hover {
  box-shadow: 0 14px 32px rgba(255, 93, 115, 0.45);
  color: #fff;
}

.track {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: rgba(43, 30, 20, 0.08);
  overflow: hidden;
}

.track-lg {
  height: 14px;
}

.fill {
  position: relative;
  height: 100%;
  border-radius: 999px;
  background: #ff5d73;
  overflow: hidden;
}

.shimmer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: shimmer 2.2s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(250%); }
}

/* 1. Hero */
.hero {
  display: flex;
  align-items: center;
  padding: clamp(100px, 15vw, 160px) clamp(24px, 6vw, 64px) clamp(88px, 12vw, 120px);
  background: #fff7ee;
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 64px;
  align-items: center;
  max-width: 1180px;
  margin: 0 auto;
  width: 100%;
}

.badge {
  display: inline-flex;
  align-items: center;
  background: #fff;
  border: 1px solid rgba(43, 30, 20, 0.1);
  border-radius: 999px;
  padding: 8px 16px;
  margin-bottom: 34px;
  color: #5c4a3a;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.kicker {
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ff5d73;
  margin-bottom: 14px;
}

.hero h1 {
  font-size: clamp(38px, 5.5vw, 60px);
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0 0 36px;
  color: #2b1e14;
}

.sub {
  font-size: clamp(16px, 1.6vw, 18px);
  line-height: 1.55;
  color: #8a7a6a;
  max-width: 460px;
  margin: 0 0 48px;
  font-weight: 500;
}

.float-stage {
  position: relative;
  height: 340px;
  margin-top: 24px;
}

.float-card {
  position: absolute;
  background: #fff;
  box-shadow: 0 14px 34px rgba(43, 30, 20, 0.1);
}

.float-notify {
  top: 10px;
  left: 0;
  width: 240px;
  border-radius: 16px;
  padding: 20px;
  animation: floatBounce2 5.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}

.notify-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notify-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #ff5d73;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.notify-title {
  font-weight: 700;
  font-size: 13.5px;
  white-space: nowrap;
}

.notify-sub {
  font-size: 12px;
  color: #8a7a6a;
  white-space: nowrap;
}

.float-progress {
  bottom: 0;
  right: 0;
  width: 250px;
  border-radius: 18px;
  padding: 22px;
  animation: floatBounce1 6.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}

.mini-label {
  font-size: 11px;
  font-weight: 700;
  color: #8a7a6a;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
}

.float-progress .track {
  margin-bottom: 10px;
}

.mini-amount {
  font-size: 20px;
  font-weight: 800;
}

.mini-sub {
  font-size: 12.5px;
  color: #8a7a6a;
  margin-top: 2px;
}

@keyframes floatBounce1 {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-16px) rotate(2deg); }
}

@keyframes floatBounce2 {
  0%, 100% { transform: translateY(0) rotate(2deg); }
  50% { transform: translateY(-12px) rotate(-2deg); }
}

/* 2. What it is */
.what {
  display: flex;
  align-items: center;
  background: #fff;
  padding: clamp(88px, 13vw, 128px) clamp(24px, 6vw, 64px);
}

.what-grid {
  max-width: 1120px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 56px;
  align-items: center;
}

.what-copy {
  max-width: 460px;
}

.what h2,
.how h2 {
  font-size: clamp(28px, 3.4vw, 38px);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 18px;
  line-height: 1.15;
}

.what-copy p {
  color: #8a7a6a;
  font-size: clamp(15px, 1.4vw, 17px);
  line-height: 1.6;
  margin: 0;
}

.demo-card {
  background: #fff7ee;
  border-radius: 20px;
  padding: clamp(22px, 3vw, 28px);
  box-shadow: 0 20px 50px rgba(43, 30, 20, 0.08);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.demo-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.demo-titles {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.demo-title {
  font-weight: 800;
  font-size: 17px;
  white-space: nowrap;
}

.demo-sub {
  font-size: 13px;
  font-weight: 700;
  color: #8a7a6a;
}

.demo-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #ff5d73;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.demo-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-numbers {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 700;
}

.demo-numbers .soft {
  color: #8a7a6a;
  font-weight: 600;
}

.divider {
  height: 1px;
  background: rgba(43, 30, 20, 0.08);
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.demo-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 93, 115, 0.14);
  color: #e14a61;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
}

.demo-who {
  display: flex;
  flex-direction: column;
}

.demo-name {
  font-size: 14px;
  font-weight: 700;
}

.demo-name em {
  font-style: normal;
  color: #e14a61;
}

.demo-when {
  font-size: 12px;
  font-weight: 600;
  color: #a99787;
}

/* 3. How to use */
.how {
  display: flex;
  align-items: center;
  padding: clamp(88px, 13vw, 128px) clamp(24px, 6vw, 64px);
  background: #fff7ee;
}

.how-inner {
  max-width: 1120px;
  margin: 0 auto;
  width: 100%;
}

.how h2 {
  margin-bottom: 48px;
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 28px;
}

.step-card {
  background: #fff;
  border-radius: 18px;
  padding: 28px;
  box-shadow: 0 10px 28px rgba(43, 30, 20, 0.06);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.step-card:hover {
  transform: translateY(-6px);
}

.step-num {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ff5d73;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  margin-bottom: 16px;
}

.step-card h3 {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 10px;
}

.step-card p {
  color: #8a7a6a;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
}

/* 4. Footer CTA */
.footer-cta {
  display: flex;
  align-items: center;
  background: #ff5d73;
  padding: clamp(96px, 14vw, 140px) clamp(24px, 6vw, 64px);
  text-align: center;
}

.footer-inner {
  max-width: 600px;
  margin: 0 auto;
}

.footer-cta h2 {
  font-size: clamp(26px, 3.4vw, 40px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fff;
  margin: 0 0 18px;
}

.cta-white {
  background: #fff;
  color: #e14a61;
  margin-bottom: 20px;
  box-shadow: 0 10px 26px rgba(43, 30, 20, 0.15);
}

.cta-white:hover {
  color: #e14a61;
}

.footer-line {
  margin: 6px 0 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14.5px;
  font-weight: 700;
}

.footer-rule {
  height: 1px;
  width: 56px;
  background: rgba(255, 255, 255, 0.3);
  margin: 20px auto;
}

.footer-credit {
  color: rgba(255, 255, 255, 0.75);
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.03em;
}
</style>
