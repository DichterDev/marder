<script setup lang="ts">
import { watch, ref, onMounted } from "vue";
import {
  DrawingUtils,
  GestureRecognizer,
  type GestureRecognizerResult,
} from "@mediapipe/tasks-vision";

const props = defineProps<{
  results: GestureRecognizerResult | null;
  videoElement: HTMLVideoElement | null;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let drawingUtils: DrawingUtils | null = null;
let ctx: CanvasRenderingContext2D | null = null;

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext("2d");
    if (ctx) drawingUtils = new DrawingUtils(ctx);
  }
});

watch(
  () => props.results,
  (newResults) => {
    if (!ctx || !drawingUtils || !newResults || !props.videoElement) return;

    canvasRef.value!.width = props.videoElement.clientWidth;
    canvasRef.value!.height = props.videoElement.clientHeight;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    newResults.landmarks.forEach((landmarks, index) => {
      const handedness = newResults.handedness[index]![0]!.categoryName;
      const gesture = newResults.gestures[index]![0]!.categoryName;
      const wrist = landmarks[0];

      drawingUtils!.drawConnectors(
        landmarks,
        GestureRecognizer.HAND_CONNECTIONS,
        {
          color: "#00FF00",
          lineWidth: 2,
        },
      );

      drawingUtils!.drawLandmarks(landmarks, {
        color: "#FF0000",
        lineWidth: 1,
        radius: 3,
      });

      ctx!.save();
      ctx!.scale(-1, 1);
      ctx!.fillStyle = "white";
      ctx!.font = "bold 12px Arial";
      const tx = -(wrist!.x * ctx!.canvas.width);
      const ty = wrist!.y * ctx!.canvas.height;
      ctx!.fillText(`${handedness}: ${gesture}`, tx + 10, ty);
      ctx!.restore();
    });
  },
);
</script>

<template>
  <canvas ref="canvasRef" class="debug-canvas mirror"></canvas>
</template>

<style scoped>
.debug-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}
.mirror {
  transform: scaleX(-1);
}
</style>

