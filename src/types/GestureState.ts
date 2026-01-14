import type { DetectedHand } from "./DetectedHand";

export interface GestureState {
  leftHand: DetectedHand;
  rightHand: DetectedHand;
  targetPosition: { x: number; y: number; z: number } | null;
}