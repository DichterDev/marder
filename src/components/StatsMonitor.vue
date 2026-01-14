<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Stats from 'stats.js';

const statsContainer = ref<HTMLDivElement | null>(null);
const stats = new Stats();
stats.showPanel(0);

onMounted(() => {
  if (statsContainer.value) {
    stats.dom.style.position = 'absolute';
    statsContainer.value.appendChild(stats.dom);
  }

  const animate = () => {
    stats.update();
    requestAnimationFrame(animate);
  };
  const frameId = requestAnimationFrame(animate);

  onUnmounted(() => {
    cancelAnimationFrame(frameId);
  });
});
</script>

<template>
  <div ref="statsContainer" class="stats-monitor"></div>
</template>

<style scoped>
.stats-monitor {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
}
</style>