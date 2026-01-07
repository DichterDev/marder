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
    <canvas ref="debugRef" class="debug-canvas mirror"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DrawingUtils, GestureRecognizer } from "@mediapipe/tasks-vision";
import { SceneManager } from "../core/SceneManager";
import { CameraHandler } from "../core/CameraHandler";

const vRef = ref<HTMLVideoElement | null>(null);
const cRef = ref<HTMLCanvasElement | null>(null);
const debugRef = ref<HTMLCanvasElement | null>(null);
const isInitialized = ref(false);

const initializeEverything = async () => {
  if (!vRef.value || !cRef.value || !debugRef.value) return;

  // 1. Setup Camera
  const cameraHandler = new CameraHandler(vRef.value);
  await cameraHandler.init();

  // 2. Setup 3D Scene
  const sceneManager = new SceneManager(cRef.value);

  // 3. Setup Audio (Must happen in click event)
  await sceneManager.initAudio();

  const debugCtx = debugRef.value.getContext("2d")!;
  const drawingUtils = new DrawingUtils(debugCtx);

  debugCtx.imageSmoothingQuality = "high";
  debugRef.value.height = vRef.value.clientHeight;
  debugRef.value.width = vRef.value.clientWidth;

  isInitialized.value = true;

  const loop = () => {
    const results = cameraHandler.getResults();

    // Render 3D Scene
    sceneManager.render(results);

    // Render 2D Debug HUD
    if (results && results.landmarks) {
      drawHUD(debugCtx, drawingUtils, results);
    }

    requestAnimationFrame(loop);
  };
  loop();
};

function drawHUD(
  ctx: CanvasRenderingContext2D,
  utils: DrawingUtils,
  results: any,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  results.landmarks.forEach((landmarks: any, index: number) => {
    const handedness = results.handedness[index][0].categoryName;
    const gesture = results.gestures[index][0].categoryName;
    const wrist = landmarks[0];

    utils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 2,
    });

    utils.drawLandmarks(landmarks, {
      color: "#FF0000",
      lineWidth: 1,
      radius: 3,
    });

    ctx.save();
    ctx.scale(-1, 1);
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    const tx = -(wrist.x * ctx.canvas.width);
    const ty = wrist.y * ctx.canvas.height;
    ctx.fillText(`${handedness}: ${gesture}`, tx + 10, ty);
    ctx.restore();
  });
}
</script>

<style scoped>
.experience-wrap {
  position: relative;
  width: 100vw;
  height: 100vh;
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
  object-fit: contain;
  opacity: 0.3;
}

.mirror {
  transform: scaleX(-1);
}

.three-canvas,
.debug-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.three-canvas {
  z-index: 15;
}
.debug-canvas {
  z-index: 10;
}
</style>
