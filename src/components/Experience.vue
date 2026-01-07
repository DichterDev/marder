<template>
  <div class="experience-wrap">
    <video ref="vRef" autoplay playsinline class="mirror video-feed"></video>

    <canvas ref="cRef" class="three-canvas"></canvas>

    <canvas ref="debugRef" class="debug-canvas mirror"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { DrawingUtils, GestureRecognizer } from "@mediapipe/tasks-vision";
import { SceneManager } from "../core/SceneManager";
import { CameraHandler } from "../core/CameraHandler";

const vRef = ref<HTMLVideoElement | null>(null);
const cRef = ref<HTMLCanvasElement | null>(null);
const debugRef = ref<HTMLCanvasElement | null>(null);

onMounted(async () => {
  const cameraHandler = new CameraHandler(vRef.value!);
  await cameraHandler.init();

  const sceneManager = new SceneManager(cRef.value!);
  const debugCtx = debugRef.value!.getContext("2d")!;
  const drawingUtils = new DrawingUtils(debugCtx);

  debugCtx.imageSmoothingQuality = "high";
  debugCtx.canvas.height = vRef.value!.clientHeight;
  debugCtx.canvas.width = vRef.value!.clientWidth;

  const loop = () => {
    const results = cameraHandler.getResults();

    // 1. Update the 3D Particle Ball (Back to previous logic)
    sceneManager.render(results);

    // 2. Draw the 2D Skeleton HUD
    if (results && results.landmarks) {
      drawHUD(debugCtx, drawingUtils, results);
    }

    requestAnimationFrame(loop);
  };
  loop();
});

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

    // Draw the skeleton lines
    utils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 2,
    });

    // Draw the landmark dots
    utils.drawLandmarks(landmarks, {
      color: "#FF0000",
      lineWidth: 1,
      radius: 3,
    });

    // Draw the Label at the wrist
    ctx.save();
    // We flip the context for text because the canvas is mirrored via CSS
    ctx.scale(-1, 1);
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";

    // Position text (Inverse X because of the scale flip)
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
} /* Keep HUD on top */
</style>
