from threading import Lock
from typing import Literal
from pydantic import BaseModel

VIEWS = ("calendar", "player", "third_view")
view_index = 0  # default: calendar
view_lock = Lock()

class GestureEvent(BaseModel):
    gesture: Literal["SWIPE_LEFT", "SWIPE_RIGHT"]

def swap_view(gesture: str) -> str:
    global view_index

    step = 1 if gesture == "SWIPE_LEFT" else -1
    with view_lock:
        view_index = (view_index + step) % len(VIEWS)
        return VIEWS[view_index]