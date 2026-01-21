<template>
  <div class="experience-wrap">
    <div v-if="!isInitialized" class="start-overlay">
      <div class="grid-container"></div>

      <div class="prompt-container">
        <div class="prompt-line webcam">turn on webcam</div>
        <div class="prompt-line audio">turn on audio</div>
        <button
          class="prompt-line insanity"
          @click="initializeEverything"
          type="button"
        >
          turn on insanity
        </button>
      </div>
    </div>

    <video ref="vRef" autoplay playsinline class="mirror video-feed"></video>
    <canvas ref="cRef" class="three-canvas"></canvas>

    <DebugHUD :results="latestResults" :video-element="vRef" />
    <StatsMonitor v-if="debugMode" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { GestureRecognizerResult } from "@mediapipe/tasks-vision";
import { SceneManager } from "../core/engine/SceneManager";
import DebugHUD from "./DebugHUD.vue";
import StatsMonitor from "./StatsMonitor.vue";
import { CameraHandler } from "@/core/controllers/CameraHandler";

const vRef = ref<HTMLVideoElement | null>(null);
const cRef = ref<HTMLCanvasElement | null>(null);
const isInitialized = ref(false);
const debugMode = ref(true);
const latestResults = ref<GestureRecognizerResult | null>(null);

const initializeEverything = async (): Promise<void> => {
  if (!vRef.value || !cRef.value) return;

  const cameraHandler = new CameraHandler(vRef.value);
  await cameraHandler.init();

  const sceneManager = new SceneManager(cRef.value);
  await sceneManager.initAudio();

  isInitialized.value = true;

  const loop = (): void => {
    const results = cameraHandler.getResults();
    latestResults.value = results;
    sceneManager.render(results);
    requestAnimationFrame(loop);
  };
  loop();
};
</script>

<style scoped>
.experience-wrap {
  position: relative;
  width: 100%;
  height: 100vh;
  background: var(--bg-black);
  overflow: hidden;
}

.start-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  background: var(--bg-black);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Point Grid Implementation:
  Uses a radial gradient background pattern to ensure infinite vertical 
  and horizontal coverage without DOM overhead.
*/
.grid-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(
    rgba(255, 255, 255, 0.4) 1px,
    transparent 1px
  );
  background-size: 32px 32px;
  background-position: center;

  /* Mask to create the "hole" behind the text and fade edges */
  mask-image: radial-gradient(
    circle at center,
    transparent 0px,
    transparent 180px,
    black 300px,
    black 60%,
    transparent 95%
  );
  -webkit-mask-image: radial-gradient(
    circle at center,
    transparent 0px,
    transparent 180px,
    black 300px,
    black 60%,
    transparent 95%
  );
}

.prompt-container {
  position: relative;
  z-index: 110;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.prompt-line {
  font-family: "monomaniac", monospace; /* Strictly following your font rule */
  font-size: 2rem;
  text-transform: lowercase;
  color: var(--text-white);
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: default;
  font-weight: 600;
  letter-spacing: 0.5px;
  line-height: 1.1;
  white-space: nowrap;
}

.webcam {
  transform: translateX(-60px);
}

.audio {
  transform: translateX(-40px);
}

.insanity {
  transform: translateX(20px);
  color: var(--brand-red);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.insanity:hover {
  opacity: 0.7;
}

.video-feed {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.2;
}

.mirror {
  transform: scaleX(-1);
}

.three-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 15;
  pointer-events: none;
}
</style>
