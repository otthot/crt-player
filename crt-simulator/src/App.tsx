import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import './App.css'
import CrtScreen from './components/CrtScreen'
import { useGetView } from './hooks/useGetView'
import type { ViewName } from './hooks/useGetView'
import Calendar from './views/CalendarView/Calendar'
import Player from './views/SpotifyPlayerView/Player'

const TRANSITION_HALF_MS = 460
const PIXEL_GRID_SIZE = 18
const PIXEL_COLORS = ['#020802', '#071607', '#0d290f', '#17451a']
const pixels = Array.from({ length: PIXEL_GRID_SIZE ** 2 }, (_, index) => ({
  delay: ((Math.floor(index / PIXEL_GRID_SIZE) * 37 + index % PIXEL_GRID_SIZE * 61) % 17) * 14,
  color: PIXEL_COLORS[(index * 7 + Math.floor(index / PIXEL_GRID_SIZE)) % PIXEL_COLORS.length],
}))

function App (){
  const targetView = useGetView()
  const [displayedView, setDisplayedView] = useState<ViewName>('calendar')
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle')
  const displayedViewRef = useRef<ViewName>('calendar')

  useEffect(() => {
    if (targetView === displayedViewRef.current) {
      const reset = window.setTimeout(() => setPhase('idle'), 0)
      return () => window.clearTimeout(reset)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const update = window.setTimeout(() => {
        displayedViewRef.current = targetView
        setDisplayedView(targetView)
        setPhase('idle')
      }, 0)
      return () => window.clearTimeout(update)
    }

    const start = window.setTimeout(() => setPhase('out'), 0)
    const swap = window.setTimeout(() => {
      displayedViewRef.current = targetView
      setDisplayedView(targetView)
      setPhase('in')
    }, TRANSITION_HALF_MS)
    const finish = window.setTimeout(() => setPhase('idle'), TRANSITION_HALF_MS * 2)

    return () => {
      window.clearTimeout(start)
      window.clearTimeout(swap)
      window.clearTimeout(finish)
    }
  }, [targetView])

  let content
  switch (displayedView) {
    case 'player':
      content = <Player />
      break
    case 'third_view':
      content = (
        <CrtScreen>
          <div className="app__placeholder">
            <span>VIEW 03</span>
            <strong>COMING SOON</strong>
          </div>
        </CrtScreen>
      )
      break
    default:
      content = <Calendar />
  }

  return (
    <div className={`app app--${phase}`}>
      <div className="app__scene">{content}</div>
      {phase !== 'idle' && (
        <div className="app__pixels" aria-hidden="true">
          {pixels.map((pixel, index) => (
            <span
              className="app__pixel"
              key={index}
              style={{
                '--pixel-delay': `${pixel.delay}ms`,
                '--pixel-color': pixel.color,
              } as CSSProperties}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default App
