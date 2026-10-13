"""Send recognized swipes to the CRT player's FastAPI backend."""

import os
from pathlib import Path
from typing import Literal

import requests
from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")
API_URL = (os.getenv("API_URL") or "http://127.0.0.1:8000").rstrip("/")
Swipe = Literal["SWIPE_LEFT", "SWIPE_RIGHT"]


def send_gesture(gesture: Swipe) -> str:
    """Post a swipe and return the view selected by the backend."""
    if gesture not in ("SWIPE_LEFT", "SWIPE_RIGHT"):
        raise ValueError(f"Unsupported gesture: {gesture}")

    response = requests.post(
        f"{API_URL}/gesture",
        json={"gesture": gesture},
        timeout=2,
    )
    response.raise_for_status()
    return response.json()["view"]


class GestureToView:
    @staticmethod
    def swipeLeft() -> str:
        return send_gesture("SWIPE_LEFT")

    @staticmethod
    def swipeRight() -> str:
        return send_gesture("SWIPE_RIGHT")
