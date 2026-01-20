import * as THREE from "three";
import type { GestureRecognizerResult } from "@mediapipe/tasks-vision";
import { Sphere } from "../objects/Sphere";
import { AudioHandler } from "../controllers/AudioHandler";
import { GestureHandler } from "../controllers/GestureHandler";
import { HandGesture } from "../../types/Gestures";
import type { GestureState } from "@/types/GestureState";
import type { Object } from "../objects/Object";

export class SceneManager {
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private audio: AudioHandler = new AudioHandler();
  private clock: THREE.Clock = new THREE.Clock();
  private gestureHandler: GestureHandler = new GestureHandler();

  private readonly frameInterval: number = 1 / 60;
  private deltaAccumulator: number = 0;

  // Active Model (to be expanded to ParticleHeart | ParticleBasketball)
  private currentModel: Object;

  constructor(canvas: HTMLCanvasElement) {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.z = 12;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.currentModel = new Sphere();
    this.scene.add(this.currentModel.mesh);

    window.addEventListener("resize", () => this.onWindowResize());
  }

  public async initAudio(): Promise<void> {
    await this.audio.init();
  }

  /**
   * Main render loop called by Vue.
   * Logic is throttled to exactly 60FPS.
   */
  public render(results: GestureRecognizerResult | null): void {
    const frameDelta = this.clock.getDelta();
    this.deltaAccumulator += frameDelta;

    // Hardcoded 60FPS Limit check
    if (this.deltaAccumulator < this.frameInterval) {
      return;
    }

    // Logic for this frame
    const logicDelta = this.deltaAccumulator;
    this.deltaAccumulator %= this.frameInterval;
    const elapsed = this.clock.getElapsedTime();

    // 1. Process Hand Data
    if (results) {
      const state = this.gestureHandler.processResults(results);
      this.applyGestureState(state);
    }

    // 2. Process Audio
    const bass = this.audio.getFrequencyData();
    this.currentModel.handleAudio(bass);

    // 3. Update Model (Time-based for fluid transitions)
    this.currentModel.update(elapsed, logicDelta);

    // 4. Render to GPU
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Maps abstract gesture states to specific 3D model actions.
   */
  private applyGestureState(state: GestureState): void {
    this.currentModel.handleGesture(state);

    if (state.targetPosition) {
      const target = new THREE.Vector3(
        state.targetPosition.x,
        state.targetPosition.y,
        state.targetPosition.z,
      );
      this.currentModel.mesh.position.lerp(target, 0.1);
    }
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public dispose(): void {
    this.renderer.dispose();
    this.currentModel.dispose();
  }
}
