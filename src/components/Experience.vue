<template>
  <div class="canvas-wrap">
    <video ref="vRef" autoplay playsinline class="mirror"></video>
    <canvas ref="cRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { SceneManager } from '../core/SceneManager'
import { CameraHandler } from '../core/CameraHandler'

const vRef = ref<HTMLVideoElement | null>(null)
const cRef = ref<HTMLCanvasElement | null>(null)

onMounted(async () => {
  const cameraHandler = new CameraHandler(vRef.value!)
  await cameraHandler.init()
  const sceneManager = new SceneManager(cRef.value!)

  const loop = () => {
    const results = cameraHandler.getResults()
    sceneManager.render(results)
    requestAnimationFrame(loop)
  }
  loop()
})
</script>

<style scoped>
.canvas-wrap {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
.mirror {
  transform: scaleX(-1);
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.4;
}
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
