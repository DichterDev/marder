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

    // 1. BASKETBALL TRACKING (Neu)
    // Wenn die linke Hand "Pointing Up" macht -> Tracking auf Zeigefinger-Spitze
    if (hands.leftHand.exists && hands.leftHand.gesture === HandGesture.POINTING_UP) {
      const tip = hands.leftHand.landmarks[HandLandmark.INDEX_FINGER_TIP];
      if (tip) {
        targetPosition = {
          // Koordinaten skalieren und zentrieren (Werte müssen ggf. an deinen Screen angepasst werden)
          x: -(tip.x - 0.5) * 20,
          y: -(tip.y - 0.5) * 11.25,
          z: -tip.z * 15,
        };
      }
    }
    // 2. Altes Co-op Movement (Optional, falls du es behalten willst)
    // Überschreibt Basketball, falls beide Hände aktiv sind
    else if (
      hands.leftHand.exists &&
      hands.rightHand.exists &&
      hands.leftHand.gesture === HandGesture.OPEN_PALM &&
      hands.rightHand.gesture === HandGesture.I_LOVE_YOU
    ) {
      const wrist = hands.leftHand.landmarks[HandLandmark.WRIST];
      if (wrist) {
        targetPosition = {
          x: -(wrist.x - 0.5) * 20,
          y: -(wrist.y - 0.5) * 11.25,
          z: -wrist.z * 15,
        };
      }
    }

    return {
      ...hands,
      targetPosition,
    };
  }

  private parseHands(results: GestureRecognizerResult): {
    leftHand: DetectedHand;
    rightHand: DetectedHand;
  } {
    let leftHand = new DetectedHand();
    let rightHand = new DetectedHand();

    results.landmarks.forEach((landmarks, index) => {
      const handedness = results.handedness[index]?.[0]?.categoryName;
      const category = results.gestures[index]?.[0];
      
      if (!category) return;

      const score = category.score;
      const gesture = category.categoryName as HandGesture;

      if (score < 0.5) return; // Nur sichere Gesten akzeptieren

      if (handedness === "Left") {
        leftHand = new DetectedHand(landmarks, gesture);
      } else if (handedness === "Right") {
        rightHand = new DetectedHand(landmarks, gesture);
      }
    });

    return { leftHand, rightHand };
  }
}