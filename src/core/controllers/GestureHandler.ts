import type { GestureRecognizerResult } from "@mediapipe/tasks-vision";
import type { GestureState } from "@/types/GestureState";
import { DetectedHand } from "@/types/DetectedHand";
import { HandGesture } from "@/types/Gestures";
import { HandLandmark } from "@/types/HandLandmarks";

export class GestureHandler {
  /**
   * Translates MediaPipe results into a clean, actionable state.
   */
  public processResults(results: GestureRecognizerResult): GestureState {
    const hands = this.parseHands(results);
    
    let targetPosition = null;

    // "Co-op Movement" Logic: Left Open Palm + Right I_LOVE_YOU
    const canMove = 
      hands.leftHand.exists && 
      hands.rightHand.exists && 
      hands.leftHand.gesture === HandGesture.OPEN_PALM && 
      hands.rightHand.gesture === HandGesture.I_LOVE_YOU;

    if (canMove) {
      const wrist = hands.leftHand.landmarks[HandLandmark.WRIST]!;
      // Map normalized 0-1 coordinates to 3D Scene coordinates
      targetPosition = {
        x: -(wrist.x - 0.5) * 25,
        y: -(wrist.y - 0.5) * 15,
        z: -wrist.z * 15
      };
    }

    return {
      ...hands,
      targetPosition
    };
  }

  private parseHands(results: GestureRecognizerResult): { leftHand: DetectedHand, rightHand: DetectedHand } {
    let leftHand = new DetectedHand();
    let rightHand = new DetectedHand();

    results.landmarks.forEach((landmarks, index) => {
      const handedness = results.handedness[index]![0]!.categoryName;
      const gesture = results.gestures[index]![0]!.categoryName as HandGesture;

      if (handedness === "Left") {
        leftHand = new DetectedHand(landmarks, gesture);
      } else if (handedness === "Right") {
        rightHand = new DetectedHand(landmarks, gesture);
      }
    });

    return { leftHand, rightHand };
  }
}