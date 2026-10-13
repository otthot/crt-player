import os
import time
from dotenv import load_dotenv
import requests
from datetime import datetime

load_dotenv()

# Constants
API_URL = 'http://127.0.0.1:8000'
SPOTIFY_URL = 'https://api.spotify.com/v1'
TOKEN_SPOTIFY_URL = 'https://accounts.spotify.com/api/token'

# Secrets
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REFRESH_TOKEN = os.getenv('REFRESH_TOKEN')

class SpotifyClient:
    def __init__(self):
        self.token = ''
        self.tokenExpiresAt = 0 # Store the actual expiration timestamp
    
    def getSpotifyToken(self) -> dict:
        data = {
            "grant_type": "refresh_token",
            "refresh_token" : REFRESH_TOKEN
        }

        auth = (CLIENT_ID, CLIENT_SECRET)
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }

        # requests handles the URL encoding of 'data' for you
        response = requests.post(
            url=TOKEN_SPOTIFY_URL,
            headers=headers,
            auth=auth,
            data=data,
            timeout=10
        )

        if response.status_code == 200:
            response_json = response.json() # Avoid using 'json' as a variable name
            
            # Mix double and single quotes to prevent f-string errors
            self.token = f"Bearer {response_json['access_token']}"
            
            # Calculate the exact timestamp when this token expires
            self.tokenExpiresAt = time.time() + response_json['expires_in']

            print(f"Retrieved token. Expires at:{datetime.fromtimestamp(self.tokenExpiresAt)}")

            return {
                'success': True,
                'message': 'Successfully retrieved new token.'
            }
        else:
            self.refreshSpotifyToken()

    def refreshSpotifyToken(self):
        data = {
            "grant_type": "refresh_token",
            "refresh_token" : REFRESH_TOKEN
        }
        auth = (CLIENT_ID, CLIENT_SECRET)
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }

        res = requests.post(
            url = TOKEN_SPOTIFY_URL,
            headers=headers,
            auth=auth,
            data=data
        )

        if res.status_code == 200:
            json = res.json()
            self.token = json['access_token']
            self.tokenExpiresAt = time.time() + json['expires_in']

            if self.token != None:
                print("Refreshed token...")
            
            return {
                "success" : True,
                "message" : 'Succesfully refreshed to a new access token'
            }
        else:
            return {
                "success" : False,
                "message" : 'Failed to refresh token'
            }

class SpotifyService(SpotifyClient):
    def __init__(self):
        super().__init__()

    # Use a property so it always grabs the current token value
    @property
    def auth_headers(self):
        return {
            'Authorization': self.token
        }

    def getPersonalCurrentlyPlaying(self):
        url = f"{SPOTIFY_URL}/me/player/currently-playing"

        response = requests.get(
            url=url,
            headers=self.auth_headers
        )
        return response.json()
