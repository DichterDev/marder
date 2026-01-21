<template>
  <div class="experience-wrap">
    <div v-if="!isInitialized" class="start-overlay">
      <button class="start-btn" @click="initializeEverything">
        ENABLE EXPERIENCE
      </button>
      <p>Camera and Microphone access required</p>
    </div>

    <video ref="vRef" autoplay playsinline class="mirror video-feed"></video>
    <canvas ref="cRef" class="three-canvas"></canvas>

    <DebugHUD :results="latestResults" :video-element="vRef" />
    <StatsMonitor v-if="debugMode" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import type { GestureRecognizerResult } from "@mediapipe/tasks-vision";
import { SceneManager } from "../core/engine/SceneManager";
import DebugHUD from "./DebugHUD.vue";
import StatsMonitor from "./StatsMonitor.vue";
import { CameraHandler } from "@/core/controllers/CameraHandler";

const vRef = ref<HTMLVideoElement | null>(null);
const cRef = ref<HTMLCanvasElement | null>(null);
const isInitialized = ref(false);
const debugMode = ref(true); // Toggle for stats.js
const latestResults = ref<GestureRecognizerResult | null>(null);
const sceneManagerRef = ref<SceneManager | null>(null);

const initializeEverything = async () => {
  if (!vRef.value || !cRef.value) return;

  const cameraHandler = new CameraHandler(vRef.value);
  await cameraHandler.init();

  const sceneManager = new SceneManager(cRef.value);
  await sceneManager.initAudio();

  sceneManagerRef.value = sceneManager;

  isInitialized.value = true;

  const loop = () => {
    const results = cameraHandler.getResults();
    latestResults.value = results;

    // The SceneManager now handles its own 60FPS throttling and time-based delta
    sceneManager.render(results);

    requestAnimationFrame(loop);
  };
  loop();
};

onBeforeUnmount(() => {
  sceneManagerRef.value?.dispose();
}, this);
</script>

<style scoped>
.experience-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
}
.start-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}
.start-btn {
  background: #00ff00;
  color: black;
  border: none;
  padding: 20px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  margin-bottom: 20px;
}
.video-feed {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.3;
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
  display: block;
}
</style>
