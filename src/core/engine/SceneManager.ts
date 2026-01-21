import * as THREE from "three";
import type { GestureRecognizerResult } from "@mediapipe/tasks-vision";
import { Sphere } from "../objects/Sphere";
import { AudioHandler } from "../controllers/AudioHandler";
import { GestureHandler } from "../controllers/GestureHandler";
import { HandGesture } from "../../types/Gestures";
import type { GestureState } from "@/types/GestureState";
import type { Object } from "../objects/Object";
import { MorphHandler } from "../controllers/MorphHandler";
import { Basketball } from "../objects/Basketball";
import { Heart } from "../objects/Heart";

// --- AUDIO CONFIG ---
const AUDIO_LIBRARY = {
  HAPPY: ["happy1.mp3", "happy2.mp3", "happy3.mp3", "happy4.mp3", "happy5.mp3"],
  SAD: ["sad1.mp3", "sad2.mp3", "sad3.mp3"],
  LOVE: ["love1.mp3", "love2.mp3", "love3.mp3"],
  PEACE: ["peace1.mp3", "peace2.mp3", "peace3.mp3", "peace4.mp3", "peace5.mp3"],
  ANGRY: ["angry1.mp3", "angry2.mp3", "angry3.mp3", "angry4.mp3"],
  BASKETBALL: ["michaeljordan.mp3"]
};

type AudioCategory = keyof typeof AUDIO_LIBRARY;

export class SceneManager {
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private audio: AudioHandler = new AudioHandler();
  private clock: THREE.Clock = new THREE.Clock();
  private gestureHandler: GestureHandler = new GestureHandler();
  private morphHandler: MorphHandler = new MorphHandler();

  private readonly frameInterval: number = 1 / 60;
  private deltaAccumulator: number = 0;

  private currentModel: Object;
  private canvas: HTMLCanvasElement;
  private currentAudioCategory: AudioCategory | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const aspect = width / height;

    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.z = 12;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.currentModel = new Sphere();
    this.scene.add(this.currentModel.mesh);

    window.addEventListener("resize", () => this.onWindowResize());
  }

  public async initAudio(): Promise<void> {
    await this.audio.init();
  }

  public render(results: GestureRecognizerResult | null): void {
    const frameDelta = this.clock.getDelta();
    this.deltaAccumulator += frameDelta;

    if (this.deltaAccumulator < this.frameInterval) return;

    const logicDelta = this.deltaAccumulator;
    this.deltaAccumulator %= this.frameInterval;
    const elapsed = this.clock.getElapsedTime();

    if (this.morphHandler.update(logicDelta)) {
      this.completeMorph();
    }

    if (results) {
      const state = this.gestureHandler.processResults(results);
      this.applyGestureState(state);
    }

    const bass = this.audio.getFrequencyData();
    this.currentModel.handleAudio(bass);

    this.currentModel.update(elapsed, logicDelta);
    this.renderer.render(this.scene, this.camera);
  }

  private applyGestureState(state: GestureState): void {
    // --- MODELL WECHSEL LOGIK (Linke Hand) ---
    if (state.leftHand.exists && !this.morphHandler.isActive()) {
      let nextModel: Object | null = null;

      switch (state.leftHand.gesture) {
        case HandGesture.OPEN_PALM: 
          // HIER: Linke offene Hand -> ALLES STOPPEN & RESET
          this.stopEverything();
          if (!(this.currentModel instanceof Sphere)) {
             nextModel = new Sphere();
          }
          break;
          
        case HandGesture.CLOSED_FIST:
          // Faust setzt nur das Modell zurück, stoppt aber Audio nicht zwingend
          // (kannst du ändern, wenn Faust auch Ton stoppen soll)
          if (!(this.currentModel instanceof Sphere)) {
             nextModel = new Sphere();
          }
          break;

        case HandGesture.POINTING_UP:
          this.triggerAudioCategory("BASKETBALL");
          if (!(this.currentModel instanceof Basketball)) {
             nextModel = new Basketball();
          }
          break;
        case HandGesture.I_LOVE_YOU:
          if (!(this.currentModel instanceof Heart)) {
             nextModel = new Heart();
          }
          break;
      }

      if (nextModel) {
        this.morphHandler.startMorph(this.currentModel, nextModel);
      }
    }

    // --- AUDIO & STIMMUNG (Rechte Hand) ---
    if (state.rightHand.exists) {
      switch (state.rightHand.gesture) {
        case HandGesture.THUMB_UP: this.triggerAudioCategory("HAPPY"); break;
        case HandGesture.THUMB_DOWN: this.triggerAudioCategory("SAD"); break;
        case HandGesture.VICTORY: this.triggerAudioCategory("PEACE"); break;
        case HandGesture.I_LOVE_YOU: this.triggerAudioCategory("LOVE"); break;
        case HandGesture.CLOSED_FIST: this.triggerAudioCategory("ANGRY"); break;
        case HandGesture.OPEN_PALM: 
          // Rechte Hand macht jetzt nichts mehr (oder du belegst es anders)
          break;
      }
    }

    if (state.leftHand.exists) {
      switch (state.leftHand.gesture) {
        case HandGesture.OPEN_PALM: this.stopEverything();
        default: break;
      
      }
    }

    // Beide Fäuste -> Angry
    if (state.leftHand.exists && state.rightHand.exists) {
      if (state.rightHand.gesture === HandGesture.CLOSED_FIST &&
          state.leftHand.gesture === HandGesture.CLOSED_FIST) {
        this.triggerAudioCategory("ANGRY");
      }
    }

    // --- TRACKING ---
    this.currentModel.handleGesture(state);

    if (state.targetPosition) {
      const target = new THREE.Vector3(
        state.targetPosition.x,
        state.targetPosition.y,
        state.targetPosition.z
      );
      this.currentModel.mesh.position.lerp(target, 0.15);
    } else {
      this.currentModel.mesh.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    }
  }

  // Stoppt Audio und setzt Kategorie zurück
  private stopEverything(): void {
    if (this.currentAudioCategory === null) return; 

    console.log("Stopping Audio (Left Hand).");
    this.audio.stop();
    this.currentAudioCategory = null;
  }

  private triggerAudioCategory(category: AudioCategory): void {
    if (this.currentAudioCategory === category) return;
    this.currentAudioCategory = category;

    const files = AUDIO_LIBRARY[category];
    const fileName = files[Math.floor(Math.random() * files.length)];
    this.audio.playAudio(`/audio/${fileName}`);
  }

  private onWindowResize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private completeMorph(): void {
    const target = this.morphHandler.getTargetModel();
    if (!target) return;
    
    const lastPos = this.currentModel.mesh.position.clone();
    
    this.scene.remove(this.currentModel.mesh);
    this.currentModel.dispose();
    
    this.currentModel = target;
    this.currentModel.mesh.position.copy(lastPos);
    this.scene.add(this.currentModel.mesh);
  }

  public dispose(): void {
    this.scene.remove(this.currentModel.mesh);
    this.renderer.dispose();
    this.currentModel.dispose();
  }
}