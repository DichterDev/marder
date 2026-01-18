import type { GestureState } from "@/types/GestureState";
import type { Points } from "three";

export interface Object {
  mesh: Points;
  update(elapsed: number, delta: number): void;
  handleGesture(state: GestureState): void;
  handleAudio(freq: number): void;
  dispose(): void;
}
