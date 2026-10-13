"""Recognize horizontal hand swipes and a held open-palm stop sign."""

from collections import deque
from pathlib import Path
import argparse
import time

import cv2 as cv
import mediapipe as mp
import requests

from web_service import send_gesture


MODEL_PATH = Path(__file__).resolve().parent / "gesture_recognizer.task"
SWIPE_WINDOW_SECONDS = 0.8
SWIPE_DISTANCE = 0.13  # Fraction of the camera image width.
MAX_VERTICAL_DRIFT = 0.18  # Fraction of the camera image height.
STOP_HOLD_SECONDS = 0.6
STOP_STILL_DISTANCE = 0.07
EVENT_COOLDOWN_SECONDS = 0.8


class GestureDetector:
    def __init__(self):
        self.positions = deque()
        self.stop_anchor = None
        self.stop_since = None
        self.stop_reported = False
        self.cooldown_until = 0.0
        self.last_seen = None

    def update(self, result, now):
        """Return (event, model gesture) for the first visible hand."""
        if not result.hand_landmarks:
            # Tracking often drops a frame during a fast swipe. Keep the
            # recent path briefly so a reappearing hand can complete it.
            if self.last_seen is not None and now - self.last_seen > 0.35:
                self._reset_hand()
            return None, None

        self.last_seen = now

        landmarks = result.hand_landmarks[0]
        # Palm center is steadier than a fingertip during a swipe.
        palm_points = (0, 5, 9, 13, 17)
        x = sum(landmarks[i].x for i in palm_points) / len(palm_points)
        y = sum(landmarks[i].y for i in palm_points) / len(palm_points)

        gesture = None
        if result.gestures and result.gestures[0]:
            category = result.gestures[0][0]
            if category.score >= 0.5:
                gesture = category.category_name

        self.positions.append((now, x, y))
        while self.positions and now - self.positions[0][0] > SWIPE_WINDOW_SECONDS:
            self.positions.popleft()

        # A swipe is a quick, mostly horizontal move. The mirrored camera
        # image makes "right" match the direction the user sees on screen.
        if now >= self.cooldown_until and len(self.positions) >= 3:
            for _, start_x, start_y in self.positions:
                dx, dy = x - start_x, y - start_y
                if abs(dx) < SWIPE_DISTANCE or abs(dy) > MAX_VERTICAL_DRIFT:
                    continue
                event = "SWIPE_RIGHT" if dx > 0 else "SWIPE_LEFT"
                self.positions.clear()
                self._reset_stop()
                self.cooldown_until = now + EVENT_COOLDOWN_SECONDS
                return event, gesture

        # An open palm held still is the stop sign. Waiting briefly avoids
        # reporting STOP at the start of an open-hand swipe.
        if gesture != "Open_Palm":
            self.stop_anchor = None
            self.stop_since = None
        elif self.stop_anchor is None:
            self.stop_anchor = (x, y)
            self.stop_since = now
        elif max(abs(x - self.stop_anchor[0]), abs(y - self.stop_anchor[1])) > STOP_STILL_DISTANCE:
            self.stop_anchor = (x, y)
            self.stop_since = now
        elif (not self.stop_reported and now >= self.cooldown_until
              and now - self.stop_since >= STOP_HOLD_SECONDS):
            self.stop_reported = True
            self.cooldown_until = now + EVENT_COOLDOWN_SECONDS
            return "STOP", gesture

        return None, gesture

    def _reset_stop(self):
        self.stop_anchor = None
        self.stop_since = None
        self.stop_reported = False

    def _reset_hand(self):
        self.positions.clear()
        self._reset_stop()
        self.last_seen = None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--camera", type=int, default=0, help="Camera index (default: 0)")
    args = parser.parse_args()

    if not MODEL_PATH.is_file():
        raise SystemExit(f"Model missing: {MODEL_PATH}")

    print(f"Opening webcam {args.camera}...", flush=True)
    camera = cv.VideoCapture(args.camera)
    if not camera.isOpened():
        camera.release()
        raise SystemExit(
            f"Could not open webcam {args.camera}. On macOS, allow camera access "
            "for your terminal in System Settings > Privacy & Security > Camera, "
            "then rerun. If you have another camera, try --camera 1."
        )

    options = mp.tasks.vision.GestureRecognizerOptions(
        base_options=mp.tasks.BaseOptions(model_asset_path=str(MODEL_PATH)),
        running_mode=mp.tasks.vision.RunningMode.VIDEO,
        num_hands=1,
    )
    detector = GestureDetector()
    last_timestamp_ms = -1
    last_event = ""
    last_event_at = 0.0

    try:
        print("Loading gesture model...", flush=True)
        with mp.tasks.vision.GestureRecognizer.create_from_options(options) as recognizer:
            print("Camera ready. Swipe left/right or hold an open palm to stop. Press Q to quit.", flush=True)
            while True:
                ok, frame = camera.read()
                if not ok:
                    print("Camera frame unavailable; stopping.")
                    break

                frame = cv.flip(frame, 1)
                rgb = cv.cvtColor(frame, cv.COLOR_BGR2RGB)
                image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
                timestamp_ms = max(time.monotonic_ns() // 1_000_000, last_timestamp_ms + 1)
                last_timestamp_ms = timestamp_ms
                result = recognizer.recognize_for_video(image, timestamp_ms)

                now = time.monotonic()
                event, gesture = detector.update(result, now)
                if event:
                    print(event, flush=True)
                    last_event, last_event_at = event, now
                    if event in ("SWIPE_LEFT", "SWIPE_RIGHT"):
                        try:
                            view = send_gesture(event)
                            print(f"Current view: {view}", flush=True)
                        except requests.RequestException as error:
                            print(f"Could not send gesture: {error}", flush=True)

                label = last_event if now - last_event_at < 1.5 else (gesture or "No hand")
                cv.putText(frame, label, (20, 45), cv.FONT_HERSHEY_SIMPLEX,
                           1, (0, 255, 0), 2, cv.LINE_AA)
                cv.putText(frame, "Q: quit", (20, frame.shape[0] - 20),
                           cv.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv.LINE_AA)
                cv.imshow("Gesture handler", frame)
                if cv.waitKey(1) & 0xFF == ord("q"):
                    break
    finally:
        camera.release()
        cv.destroyAllWindows()


if __name__ == "__main__":
    main()
