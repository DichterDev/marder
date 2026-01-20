<script lang="ts" setup>
import ExperienceComponent from "@/components/ExperienceComponent.vue";
import HeaderComponent from "@/components/HeaderComponent.vue";
</script>

<template>
  <div class="home-page-wrapper">
    <HeaderComponent></HeaderComponent>

    <main class="centering-layer">
      <div class="viewport-container">
        <ExperienceComponent class="full-size" />

        <canvas id="particleCanvas"></canvas>
        <div id="dataOverlay"></div>

        <div class="status-overlay">
          <div class="dot"></div>
          <span id="connectionStatus">Offline</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="css" scoped>
.home-page-wrapper {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-image: url("/assets/background.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.centering-layer {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(
    180deg,
    var(--brand-red) -50%,
    rgba(0, 0, 0, 0) 40%
  );
}

.viewport-container {
  position: relative;
  width: 60vw;
  aspect-ratio: 16 / 9; /* Maintains aspect ratio */
  background: #050505;
  border: 1px solid var(--brand-red);
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.full-size {
  width: 100% !important;
  height: 100% !important;
}

#particleCanvas {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  transform: scaleX(-1);
}

#dataOverlay {
  position: absolute;
  top: 20px;
  right: 20px;
  text-align: right;
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--brand-red);
  z-index: 10;
}

.status-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  font-size: 0.7rem;
  color: var(--brand-red);
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
}

.dot {
  width: 6px;
  height: 6px;
  background-color: var(--brand-red);
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
  }
}
</style>
