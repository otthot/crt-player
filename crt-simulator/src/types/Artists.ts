export interface SpotifyImage {
  url: string
  height: number
  width: number
}

export interface ExternalUrls {
  spotify: string
}

export interface ArtistProfile {
  external_urls: ExternalUrls
  href: string
  id: string
  images: SpotifyImage[]
  name: string
  type: string
  uri: string
}
