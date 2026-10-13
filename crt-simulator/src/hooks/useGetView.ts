import { useEffect } from 'react'
import { useFetch } from './useClient'

export type ViewName = 'calendar' | 'player' | 'third_view'

type ViewResponse = {
  view: ViewName
}

const POLL_INTERVAL_MS = 250

export function useGetView() {
  const { data, commonFetch } = useFetch<ViewResponse>({
    method: 'GET',
    endpoint: '/view',
  })

  useEffect(() => {
    void commonFetch()
    const interval = window.setInterval(() => {
      void commonFetch()
    }, POLL_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [commonFetch])

  return data?.view ?? 'calendar'
}
