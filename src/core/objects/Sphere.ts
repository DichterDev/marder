import * as THREE from "three";
import { PARTICLE_RES } from "../Constants";
import vertexShader from "../shaders/sphere/vertex.glsl";
import fragmentShader from "../shaders/sphere/fragment.glsl";
import type { Object } from "./Object";
import { HandGesture } from "@/types/Gestures";
import { Color } from "@/types/Color";
import type { GestureState } from "@/types/GestureState";
import { lerp } from "three/src/math/MathUtils.js";

type GrowthDirection = -1 | 0 | 1;

export class Sphere implements Object {
  public mesh: THREE.Points;
  private material: THREE.ShaderMaterial;

  private targetColorStart = new THREE.Color(0xffffff);
  private targetColorEnd = new THREE.Color(0x757575);

  private currentScale = 1.0;
  private growthDirection: GrowthDirection = 0;

  private explosionStartTime = 0;
  private isExploding = false;
  private onCooldown = false;

  private readonly SCALE_MIN = 0.1;
  private readonly SCALE_MAX = 3.0;

  private readonly EXPLOSION_DURATION = 3.0;
  private readonly EXPLOSION_COOLDOWN = 10.0;

  constructor() {
    const geometry = new THREE.SphereGeometry(
      1.0,
      PARTICLE_RES - 1,
      PARTICLE_RES - 1,
    );

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
        uMorphProgress: { value: 0.0 },
      },
      transparent: false,
      blending: THREE.NormalBlending,
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

    if (this.onCooldown) return;

    this.mesh.rotation.y += 0.5 * delta;
    this.mesh.rotation.x += 0.2 * delta;

    if (this.growthDirection == 0) {
      // no growth
    } else if (this.growthDirection == 1) {
      this.currentScale = lerp(this.currentScale, this.SCALE_MAX + 0.01, 0.05);
    } else if (this.growthDirection == -1) {
      this.currentScale = lerp(this.currentScale, this.SCALE_MIN - 0.01, 0.05);
    }
    this.syncScale();
  }

  public handleGesture(state: GestureState): void {
    if (state.leftHand.exists) {
      // IMPORTANT: no break on non scale related, breaks scaling logic
      switch (state.leftHand.gesture) {
        case HandGesture.THUMB_UP:
          // increase scale
          this.growthDirection = 1;
          break;
        case HandGesture.THUMB_DOWN:
          // decrase scale
          this.growthDirection = -1;
          break;
        default:
          this.growthDirection = 0;
          break;
      }
    }

    if (state.rightHand.exists) {
      switch (state.rightHand.gesture) {
        case HandGesture.OPEN_PALM:
          this.setGradient(Color.NOISE_START, Color.NOISE_END);
          break;
        case HandGesture.I_LOVE_YOU:
          this.setGradient(Color.LOVE_START, Color.LOVE_END);
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
        default:
          break;
      }
    }

    if (state.leftHand.exists && state.leftHand.exists) {
      if (
        state.rightHand.gesture === HandGesture.CLOSED_FIST &&
        state.leftHand.gesture === HandGesture.CLOSED_FIST
      ) {
        this.setGradient(Color.ANGRY_START, Color.ANGRY_END);
        this.triggerExplosion();
      }
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
    if (this.currentScale > this.SCALE_MAX) {
      this.currentScale = this.SCALE_MAX;
    } else if (this.currentScale < this.SCALE_MIN) {
      this.currentScale = this.SCALE_MIN;
    }

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
