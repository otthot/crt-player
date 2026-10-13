from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import GestureHandler
from GestureHandler import GestureEvent
from SpotifyClient import SpotifyService

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Create a single, global instance of your service
spotify_service = SpotifyService()

# Fetch the initial token right away when the server starts
spotify_service.getSpotifyToken()

# 2. Create a "dependency" function
# FastAPI will call this function whenever a route needs the Spotify service
def get_spotify_service():
    return spotify_service

@app.get("/health")
def read_root():
    return {
        "message": "Hello world!"
    }

# 3. Inject the dependency into your route using Depends()
@app.get("/playing")
def getTopFive(spotify: SpotifyService = Depends(get_spotify_service)):
    
    # 4. Call your method
    data = spotify.getPersonalCurrentlyPlaying()

    # print(data.item.album.name)
    
    return data

@app.post("/gesture")
def receive_gesture(event: GestureEvent):
    return {"view": GestureHandler.swap_view(event.gesture)}

@app.get("/view")
def get_view():
    with GestureHandler.view_lock:
        return {"view": GestureHandler.VIEWS[GestureHandler.view_index]}
