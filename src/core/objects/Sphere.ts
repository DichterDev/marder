import * as THREE from "three";
import { PARTICLE_RES } from "../Constants";
import vertexShader from "../shaders/sphere/vertex.glsl";
import fragmentShader from "../shaders/sphere/fragment.glsl";
import type { Object } from "./Object";
import { HandGesture } from "@/types/Gestures";
import { Color } from "@/types/Color";
import type { GestureState } from "@/types/GestureState";
import { lerp } from "three/src/math/MathUtils.js";

export class Sphere implements Object {
  public mesh: THREE.Points;
  private material: THREE.ShaderMaterial;

  private targetColorStart = new THREE.Color(0xffffff);
  private targetColorEnd = new THREE.Color(0x757575);

  private currentScale = 1.0;
  private minScale = 0.1;

  private explosionStartTime = 0;
  private isExploding = false;
  private onCooldown = false;

  private readonly EXPLOSION_DURATION = 3.0;
  private readonly EXPLOSION_COOLDOWN = 10.0;

  constructor() {
    const geometry = new THREE.SphereGeometry(1.0, PARTICLE_RES, PARTICLE_RES);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAudioFreq: { value: 0 },
        uScale: { value: 1.0 },
        uColorStart: { value: this.targetColorStart },
        uColorEnd: { value: this.targetColorEnd },
        uRainbow: { value: true },
        uExplode: { value: false },
        uExplodeTime: { value: 0.0 },
      },
      transparent: false,
      blending: THREE.NoBlending,
      depthWrite: true,
    });

    this.mesh = new THREE.Points(geometry, this.material);
  }

  public update(elapsed: number, delta: number): void {
    const uniforms = this.material!.uniforms;

    uniforms.uTime!.value = elapsed;

    if (this.isExploding) {
      const deltaStartTime = elapsed - this.explosionStartTime;

      if (deltaStartTime < this.EXPLOSION_DURATION) {
        uniforms.uExplodeTime!.value = deltaStartTime;
      }

      if (deltaStartTime >= this.EXPLOSION_COOLDOWN) {
        this.resetExplosion();
      }
    }

    this.syncScale();

    if (this.onCooldown) return;

    this.mesh.rotation.y += 0.5 * delta;
    this.mesh.rotation.x += 0.2 * delta;
  }

  public handleGesture(state: GestureState): void {
    if (!state.rightHand) return;

    const gesture: HandGesture = state.rightHand.gesture;
    switch (gesture) {
      case HandGesture.OPEN_PALM:
        this.setGradient(Color.NOISE_START, Color.NOISE_END);
        break;
      case HandGesture.THUMB_UP:
        this.setGradient(Color.HAPPY_START, Color.HAPPY_END);
        break;
      case HandGesture.THUMB_DOWN:
        this.setGradient(Color.SAD_START, Color.SAD_END);
        break;
      case HandGesture.VICTORY:
        this.setGradient(Color.PEACE, Color.PEACE);
        break;
      case HandGesture.CLOSED_FIST:
        this.setGradient(Color.ANGRY_START, Color.ANGRY_END);
        this.triggerExplosion();
        break;
      default:
        break;
    }
  }

  public handleAudio(bass: number): void {
    this.setAudioReaction(bass);
  }

  public dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }

  private setGradient(start: Color, end: Color): void {
    if (start == Color.PEACE) {
      this.setRainbow(true);
      return;
    }

    this.setRainbow(false);

    this.targetColorStart.set(start);
    this.targetColorEnd.set(end);
    console.log(`${start} : ${end}`);
  }

  private setAudioReaction(freq: number): void {
    this.material!.uniforms.uAudioFreq!.value = freq;
  }

  private setRainbow(state: boolean) {
    this.material!.uniforms.uRainbow!.value = state;
  }

  private syncScale() {
    this.material.uniforms.uScale!.value = this.currentScale;
  }

  private triggerExplosion(): void {
    if (this.onCooldown || this.isExploding) return;

    this.isExploding = true;
    this.onCooldown = true;
    this.explosionStartTime = this.material!.uniforms.uTime!.value;
    this.material.uniforms.uExplode!.value = true;
  }

  private resetExplosion(): void {
    this.isExploding = false;
    this.onCooldown = false;

    this.material.uniforms.uExplode!.value = false;
    this.material.uniforms.uExplodeTime!.value = 0.0;
  }
}
