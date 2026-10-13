import { useEffect } from 'react'
import { useFetch } from './useClient'
import type { ArtistProfile } from '../types/Artists'

export const useGetArtist = () => {
  const { isLoading, data, commonFetch, error } = useFetch<ArtistProfile>({
    endpoint: '/playing',
    method: 'GET',
  })

  useEffect(() => {
    void commonFetch()
  }, [commonFetch])

  return { isLoading, data, error }
}

export const useGetArtists = () => {
  const { isLoading, data, commonFetch } = useFetch({
    method: 'GET',
    endpoint: '/health',
  })

  return { isLoading, data, commonFetch }
}
