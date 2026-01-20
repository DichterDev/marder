<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <header>
    <div class="logo-section">
      <RouterLink to="/">
        <img src="/assets/Moritz_Marder.png" alt="Logo" class="logo-icon" />
      </RouterLink>
      <span class="brand-name">Multimaniac</span>
    </div>
    <RouterLink to="/about">
      <img src="/assets/Menu_icon.png" alt="Menu" class="menu-icon" />
    </RouterLink>
  </header>
</template>

<style lang="css" scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background: transparent;
  z-index: 10;
  height: 120px;
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-icon {
  height: 80px;
  filter: brightness(0) invert(1);
}

.brand-name {
  font-family: "monomaniac", monospace;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 0.5px;
}

.menu-icon {
  width: 50px;
  height: 50px;
  cursor: pointer;
}
</style>
