import * as THREE from "three";
import type { GestureRecognizerResult } from "@mediapipe/tasks-vision";
import { ParticleBall } from "../objects/ParticleBall";
import { AudioHandler } from "../controllers/AudioHandler";
import { GestureHandler } from "../controllers/GestureHandler";
import { HandGesture } from "../../types/Gestures";
import type { GestureState } from "@/types/GestureState";

export class SceneManager {
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private audio: AudioHandler = new AudioHandler();
  private clock: THREE.Clock = new THREE.Clock();
  private gestureHandler: GestureHandler = new GestureHandler();
  
  // High-performance FPS Control
  private readonly fpsLimit: number = 60;
  private readonly frameInterval: number = 1 / 60;
  private deltaAccumulator: number = 0;

  // Active Model (to be expanded to ParticleHeart | ParticleBasketball)
  private currentModel: ParticleBall;

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

    this.currentModel = new ParticleBall();
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
    this.currentModel.setAudioReaction(bass);

    // 3. Update Model (Time-based for fluid transitions)
    this.currentModel.update(elapsed, logicDelta);

    // 4. Render to GPU
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Maps abstract gesture states to specific 3D model actions.
   */
  private applyGestureState(state: GestureState): void {
    // Left Hand: Morphing States
    if (state.leftHand.exists) {
      this.currentModel.setImplode(state.leftHand.gesture === HandGesture.CLOSED_FIST);
      this.currentModel.setExplode(state.leftHand.gesture === HandGesture.POINTING_UP);
    }

    // Right Hand: Color Transitions
    if (state.rightHand.exists) {
      if (state.rightHand.gesture === HandGesture.OPEN_PALM) {
        this.currentModel.setGradient("#ff3333", "#ff9900"); // Red-Orange gradient
      }
      if (state.rightHand.gesture === HandGesture.THUMB_UP) {
        this.currentModel.setGradient("#33ff33", "#00ffff"); // Green-Cyan gradient
      }
    }

    // Co-op: World Position Lerp
    if (state.targetPosition) {
      const target = new THREE.Vector3(state.targetPosition.x, state.targetPosition.y, state.targetPosition.z);
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