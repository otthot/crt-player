import CrtScreen from '../../components/CrtScreen'
import { useGetPlayingTrack } from '../../hooks/useTrack'
import './Player.css'

function AlbumCover({ href }: { href?: string }) {
  return <img className="player__cover" src={href} alt="Album cover" />
}

function ActionButtons(){

  const next = <button>Next</button>
  const pause = <button>Pause</button>
  const back = <button>Back</button>

  return (
    <div className="player__actions">
      {back}
      {pause}
      {next}
    </div>
  )
}


function ProgressBar({progressMs, durationMs} : {progressMs : number, durationMs : number}){
  // {currentMs, totalMs} : {currentMs : number, totalMs : number}

  const progress = durationMs > 0 ? progressMs / durationMs : 0

  return (
    <div className="player__progress">
      <div className="player__progress-fill" style={{ width: `${progress * 100}%` }}></div>
    </div>
  )

}

export function Player() {

  const { data, error } = useGetPlayingTrack()

  // if (isLoading) return <p>Loading...</p>
  if (error) return <p>Could not load artist: {error.message}</p>
  if (!data) return <p>No artist found...</p>

  const progressMs = data.progress_ms || 0
  const durationMs = data.item?.duration_ms || 0

  return (
    <CrtScreen>
      <main className="player">
        <AlbumCover href={data.item?.album.images[0].url}/>
        <ProgressBar progressMs={progressMs} durationMs={durationMs} />
      </main>
    </CrtScreen>
  )
}

export default Player
