<script setup lang="ts">
import HeaderComponent from "@/components/HeaderComponent.vue";
</script>

<template>
  <HeaderComponent></HeaderComponent>
  <main>
    <div class="top-gradient"></div>
    <div class="content">
      <div class="vertical-title">
        <div class="vertical white">
          <span>A</span>
          <span>B</span>
          <span>O</span>
          <span>U</span>
          <span>T</span>
        </div>
        <div class="vertical red">
          <span>M</span>
          <span>U</span>
          <span>L</span>
          <span>T</span>
          <span>I</span>
          <span>M</span>
          <span>A</span>
          <span>N</span>
          <span>I</span>
          <span>A</span>
          <span>C</span>
        </div>
      </div>
      <div class="text">
        <p>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
          ipsum dolor sit amet.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
          ipsum dolor sit amet.
        </p>
        <p>
          Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse
          molestie consequat, vel illum dolore eu feugiat nulla facilisis at
          vero eros et accumsan et iusto odio dignissim qui blandit praesent
          luptatum zzril delenit augue duis dolore te feugait nulla facilisi.
          Lorem ipsum dolor sit amet.
        </p>
      </div>
    </div>
  </main>
</template>

<style lang="css" scoped>
.top-gradient {
  height: 120px;
  background: linear-gradient(
    180deg,
    #7b001a 0%,
    #4b0010 50%,
    rgba(0, 0, 0, 0) 100%
  );
}
.content {
  display: flex;
  gap: 90px;
  padding: 30px 400px;
  box-sizing: border-box;
  align-items: flex-start;
  justify-content: center;
}
.vertical-title {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}
.vertical {
  display: flex;
  flex-direction: column;
  font-family: "monomaniac", monospace;
  font-size: 2.2rem;
  line-height: 1.05;
}
.vertical.white span {
  color: #ffffff;
  font-weight: 900;
}
.vertical.red span {
  color: var(--brand-red);
  font-weight: 900;
}
.text {
  max-width: 560px;
  color: #eaeaea;
  font-size: 0.95rem;
  font-weight: 900;
  line-height: 1.6;
  text-align: justify;
}
.text p {
  margin: 0 0 26px 0;
}
</style>
