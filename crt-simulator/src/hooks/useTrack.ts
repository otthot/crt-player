import { useEffect } from "react";
import { useFetch } from "./useClient";
import type { PlayingTrack } from "../types/PlayingTrack";

const INTERVAL_MS = 1000 // 1sec

export const useGetPlayingTrack = () => {
  const { isLoading, data, commonFetch, error } = useFetch<PlayingTrack>({
    endpoint: '/playing',
    method: 'GET',
  })

  useEffect(() => {
    // Fetch immediately
    void commonFetch()

    // Fetch repeatedly
    const interval = setInterval(() => {
      void commonFetch()
    }, INTERVAL_MS)

    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [commonFetch])

  return { isLoading, data, error }
}