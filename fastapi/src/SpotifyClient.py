import os
import time
from datetime import datetime

import requests
from dotenv import load_dotenv


load_dotenv()

SPOTIFY_URL = 'https://api.spotify.com/v1'
TOKEN_SPOTIFY_URL = 'https://accounts.spotify.com/api/token'

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
REFRESH_TOKEN = os.getenv('REFRESH_TOKEN')


class SpotifyClient:
    def __init__(self):
        self.token = ''
        self.tokenExpiresAt = 0

    def getSpotifyToken(self) -> dict:
        response = requests.post(
            url=TOKEN_SPOTIFY_URL,
            auth=(CLIENT_ID, CLIENT_SECRET),
            data={
                'grant_type': 'refresh_token',
                'refresh_token': REFRESH_TOKEN,
            },
            timeout=10,
        )
        response.raise_for_status()
        token_data = response.json()

        self.token = f"Bearer {token_data['access_token']}"
        self.tokenExpiresAt = time.time() + token_data['expires_in']
        print(f"Retrieved token. Expires at: {datetime.fromtimestamp(self.tokenExpiresAt)}")

        return {
            'success': True,
            'message': 'Successfully retrieved new token.',
        }

    def refreshSpotifyToken(self):
        return self.getSpotifyToken()


class SpotifyService(SpotifyClient):
    @property
    def auth_headers(self):
        return {'Authorization': self.token}

    def getPersonalCurrentlyPlaying(self):
        url = f'{SPOTIFY_URL}/me/player/currently-playing'

        if time.time() >= self.tokenExpiresAt - 60:
            self.refreshSpotifyToken()

        response = requests.get(url=url, headers=self.auth_headers, timeout=10)

        # A revoked token can expire before its advertised lifetime.
        if response.status_code == 401:
            self.refreshSpotifyToken()
            response = requests.get(url=url, headers=self.auth_headers, timeout=10)

        # Spotify can return no body when there is no active playback.
        if response.status_code == 204:
            return None

        response.raise_for_status()
        if not response.content:
            return None

        return response.json()
