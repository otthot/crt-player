import './App.css'
import CrtScreen from './components/CrtScreen'
import { useGetPlayingTrack } from './hooks/useTrack'

const WIDTH = 500

function AlbumCover({ href }: { href?: string }) {
  return (
    <img
      src={href}
      alt="Album cover"
      style={{
        width: `${WIDTH}px`,
        height: '500px',
      }}
    />
  )
}

function ActionButtons(){

  const next = <button>Next</button>
  const pause = <button>Pause</button>
  const back = <button>Back</button>

  return (
    <div
      style={{
        display : 'flex',
        justifyContent : 'space-between',
        alignItems : 'center'
      }}
    >
      {back}
      {pause}
      {next}
    </div>
  )
}


function ProgressBar({progressMs, durationMs} : {progressMs : number, durationMs : number}){
  // {currentMs, totalMs} : {currentMs : number, totalMs : number}

  const progress = (progressMs / durationMs);
  const progressWidth = `${progress * WIDTH}px`

  console.log(progressWidth)

  return (
    <div 
      style={{
        paddingTop : "4px",
        overflow : 'hidden',
        borderRadius : '4px',
        display : 'flex',
        width : `${WIDTH}px`,
        height : '20px'
      }}
    >
      <div 
        style={{
          height : "20px",
          width : progressWidth,
          backgroundColor : 'green'
        }}></div>
    </div>
  )
  
}

function App() {

  const { data, error } = useGetPlayingTrack()

  // if (isLoading) return <p>Loading...</p>
  if (error) return <p>Could not load artist: {error.message}</p>
  if (!data) return <p>No artist found...</p>

  const progressMs = data.progress_ms || 0
  const durationMs = data.item?.duration_ms || 0

  return (
    <main style={{ width: '100%', height: '95vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CrtScreen>
        <AlbumCover href={data.item?.album.images[0].url}/>
        <ProgressBar progressMs={progressMs} durationMs={durationMs} />
      </CrtScreen>
    </main>
  )
}

export default App
