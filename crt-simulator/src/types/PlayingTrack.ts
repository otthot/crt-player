import type { ExternalUrls, SpotifyImage } from './Artists'

export interface SimplifiedArtist {
  external_urls: ExternalUrls
  href: string
  id: string
  name: string
  type: 'artist'
  uri: string
}

export interface Album {
  album_type: 'album' | 'single' | 'compilation'
  artists: SimplifiedArtist[]
  external_urls: ExternalUrls
  href: string
  id: string
  images: SpotifyImage[]
  name: string
  release_date: string
  release_date_precision: 'year' | 'month' | 'day'
  total_tracks: number
  type: 'album'
  uri: string
}

export interface Track {
  album: Album
  artists: SimplifiedArtist[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_urls: ExternalUrls
  href: string
  id: string
  is_local: boolean
  name: string
  preview_url: string | null
  track_number: number
  type: 'track'
  uri: string
}

export interface PlaybackContext {
  external_urls: ExternalUrls
  href: string
  type: 'playlist' | 'album' | 'artist' | 'show'
  uri: string
}

export interface PlayingTrack {
  is_playing: boolean
  timestamp: number
  context: PlaybackContext | null
  progress_ms: number | null
  item: Track | null
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown'
  actions: {
    disallows: Partial<Record<string, boolean>>
  }
}
