import * as THREE from "three";
import { PARTICLE_RES, PARTICLE_COUNT } from "../Constants";
import vertexShader from "../shaders/heart/vertex.glsl";
import fragmentShader from "../shaders/heart/fragment.glsl";
import type { Object } from "./Object";
import type { GestureState } from "@/types/GestureState";
import { Color } from "@/types/Color";

export class Heart implements Object {
  public mesh: THREE.Points;
  private material: THREE.ShaderMaterial;
  private currentScale: number = 1;

  constructor() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_RES; i++) {
      for (let j = 0; j < PARTICLE_RES; j++) {
        const u = (i / PARTICLE_RES) * Math.PI * 2;
        const v = (j / PARTICLE_RES) * Math.PI;

        const xBase = 16 * Math.pow(Math.sin(u), 3);
        const yBase =
          13 * Math.cos(u) -
          5 * Math.cos(2 * u) -
          2 * Math.cos(3 * u) -
          Math.cos(4 * u);

        const x = xBase * Math.sin(v);
        const y = yBase * Math.sin(v);
        const z = Math.cos(v) * 8;

        const index = (i * PARTICLE_RES + j) * 3;

        const yOffset = -2;
        positions[index] = x * 0.1;
        positions[index + 1] = (y + yOffset) * 0.1;
        positions[index + 2] = z * 0.1;
      }
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAudioFreq: { value: 0 },
        uScale: { value: 1.0 },
        uColorStart: { value: new THREE.Color(Color.LOVE_START) },
        uColorEnd: { value: new THREE.Color(Color.LOVE_END) },
        uMorphProgress: { value: 0.0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Points(geometry, this.material);
  }

  handleAudio(freq: number): void {
    this.material.uniforms.uAudioFreq!.value = freq;
  }

  handleGesture(state: GestureState): void {}

  public update(elapsed: number, delta: number): void {
    const uniforms = this.material.uniforms;
    uniforms.uTime!.value = elapsed;

    this.mesh.rotation.y += 0.8 * delta;

    uniforms.uScale!.value = 1.0;
  }

  public setAudioReaction(freq: number): void {}

  public dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
