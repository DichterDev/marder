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
        <p>Ziel war die Entwicklung einer erweiterten Form der Wahrnehmung, die an synästhetische Übersetzungsprozesse angelehnt war. Audiosignale wurden visuell erfahrbar gemacht, indem sie in Farbwerte und bildhafte Repräsentationen übersetzt wurden, wodurch ein vielschichtiges Zusammenspiel von Klang und Bild entstand. Auf diese Weise wurden neue Zugänge zu multisensorischer Erfahrung eröffnet und bestehende Wahrnehmungsgrenzen bewusst thematisiert und reflektiert.</p>
        <p>Gleichzeitig wurden Farben als Ausgangspunkt für akustische Transformationen eingesetzt und zur gezielten Beeinflussung klanglicher Parameter genutzt. Durch diese bidirektionale Beziehung zwischen visuellen und auditiven Ebenen wurde ein dynamischer Prozess erzeugt, in dem sich beide Modalitäten fortlaufend veränderten und gegenseitig beeinflussten. Der Schwerpunkt lag dabei auf der systematischen und experimentellen Untersuchung dieser Wechselwirkungen sowie ihrer gestalterischen und konzeptuellen Potenziale.</p>
        <p>Ergänzend wurde Motion Tracking integriert, um visuelle Darstellungen zu modulieren oder Audiosignale in Echtzeit zu verändern. Aspekte der Farbwahrnehmung, der Farbenpsychologie sowie ein analytisch-kreativer Umgang mit Bewegung und Interaktion bildeten zentrale Bestandteile des abgeschlossenen Konzepts. Auf diese Weise wurde ein immersiver Erfahrungsraum realisiert, in dem Wahrnehmung als prozesshafter, wandelbarer Zustand erfahrbar gemacht wurde.</p>
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
