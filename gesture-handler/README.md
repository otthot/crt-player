# Webcam gesture handler

This script prints `SWIPE_LEFT`, `SWIPE_RIGHT`, or `STOP` when it sees a gesture. Swipe with one hand across the camera view; hold an open palm still for about 0.6 seconds to signal stop. The preview is mirrored, so left and right match what you see.

## Setup

Use Python 3.11 and install the dependencies:

```sh
cd gesture-handler
uv venv --python 3.11 .venv
uv pip install --python .venv/bin/python -r requirements.txt
```

Download the [official Gesture Recognizer model](https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/latest/gesture_recognizer.task) as `gesture-handler/gesture_recognizer.task` if it is not already there.

## Run

```sh
.venv/bin/python webcam_gestures.py
```

Start the FastAPI backend before running the gesture handler. On each left or right swipe, the handler posts to `/gesture` and prints the selected view. It uses `API_URL` from the repository `.env`, or `http://127.0.0.1:8000` by default. `STOP` is only displayed locally for now.

The first run may prompt for camera access. On macOS, grant access to the app launching Python in **System Settings → Privacy & Security → Camera** if the camera cannot open. Press **Q** in the preview to quit. If you have multiple cameras, use `--camera 1` (or another index).
